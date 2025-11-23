import express from "express";
import { db } from "../../database/db";
import { attachmentsTable, usersTable } from "../../database";
import { eq } from "drizzle-orm";
const router = express.Router();
import profileRouter from "./profile";
import { requireAuth } from "../../helpers/middlewares/Auth";
import FileValidationMiddleware from "../../helpers/middlewares/FileValidation";
import fileUpload, { UploadedFile } from "express-fileupload";
import S3 from "../../cdn";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import BodyValidationMiddleware from "../../helpers/middlewares/BodyValidation";
import { updateUserSchema } from "../../helpers/validations/user/update";
import {
  ComparePassword,
  EncryptPassword,
} from "../../helpers/encryptions/password";
import { createToken } from "../../email/verification/generateToken";
router.use(fileUpload({ safeFileNames: true }));

router.get("/me", async (req, res) => {
  if (!req.user?.id) return res.status(200).json({});

  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      profilePicture: usersTable.profilePicture,
      banner: usersTable.banner,
      email: usersTable.email,
      emailVerified: usersTable.emailVerified,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id));

  return res.status(200).json({ user });
});

router.post(
  "/me/picture",
  requireAuth,
  (req, res, next) =>
    FileValidationMiddleware(req, res, next, "picture", {
      maxSize: 20 * 1024 * 1024,
      mimetype: "image/",
    }),
  async (req, res) => {
    const file = req.files?.picture as UploadedFile;
    const uuid = crypto.randomUUID();
    const key = `profilePicture/${req.user?.id}/${uuid}.${file.mimetype.replace(
      "image/",
      ""
    )}`;

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
    );

    await db
      .update(usersTable)
      .set({
        profilePicture: key.replace("profilePicture/", ""),
      })
      .where(eq(usersTable.id, req.user?.id!));

    await db.insert(attachmentsTable).values({
      uploadedBy: req.user?.id!,
      type: "profilePicture",
      uuid,
      key,
    });

    return res
      .status(200)
      .json({ success: true, key: key.replace("profilePicture/", "") });
  }
);

router.post(
  "/me/banner",
  requireAuth,
  (req, res, next) =>
    FileValidationMiddleware(req, res, next, "banner", {
      maxSize: 20 * 1024 * 1024,
      mimetype: "image/",
    }),
  async (req, res) => {
    const file = req.files?.banner as UploadedFile;
    const uuid = crypto.randomUUID();

    const key = `banner/${req.user?.id}/${uuid}.${file.mimetype.replace(
      "image/",
      ""
    )}`;

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
    );

    await db
      .update(usersTable)
      .set({ banner: key.replace("banner/", "") })
      .where(eq(usersTable.id, req.user?.id!));

    await db.insert(attachmentsTable).values({
      uploadedBy: req.user?.id!,
      type: "banner",
      uuid,
      key,
    });

    return res
      .status(200)
      .json({ success: true, key: key.replace("banner/", "") });
  }
);

router.post(
  "/me",
  requireAuth,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, updateUserSchema),
  async (req, res) => {
    const { email, password, newPassword, username, displayName } = req.body;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.id));
    let update: Record<string, any> = {};
    if (email) {
      if (!ComparePassword(password, user.password))
        return res.status(401).json({
          success: false,
          message: "fail",
          errors: {
            password: ["Password is incorrect."],
          },
        });

      const [findemail] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));
      if (findemail)
        return res.status(400).json({
          success: false,
          message: "email already registered.",
          errors: {
            email: ["Email already registered."],
          },
        });
      update.email = email;
      update.emailVerified = false;
    }

    if (password && newPassword) {
      if (!ComparePassword(password, user.password))
        return res.status(401).json({
          success: false,
          message: "fail",
          errors: {
            password: ["Password is incorrect."],
          },
        });

      update.password = EncryptPassword(newPassword);
    }

    if (username) {
      const [findname] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username));
      if (findname)
        return res.status(400).json({
          success: false,
          message: "Username exists",
          errors: {
            username: ["Username already exists"],
          },
        });

      update.username = username;
    }

    if (displayName) update.displayName;

    await db.update(usersTable).set(update).where(eq(usersTable.id, user.id));

    res.status(200).json({ success: true });
    if (update.email) await createToken(update.email);
  }
);

router.use(profileRouter);

export default router;
