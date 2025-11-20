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
router.use(fileUpload({ safeFileNames: true }));

router.get("/me", async (req, res) => {
  if (!req.user?.id) return res.status(200).json({});

  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      profilePicture: usersTable.profilePicture,
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

router.use(profileRouter);

export default router;
