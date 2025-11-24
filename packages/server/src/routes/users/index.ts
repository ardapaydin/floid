import express from "express";
import { db } from "../../database/db";
import {
  attachmentsTable,
  blockedUsersTable,
  bookmarksTable,
  commentsTable,
  communitiesTable,
  communityMembersTable,
  usersTable,
  voteTable,
} from "../../database";
import { and, count, desc, eq, inArray, isNotNull, or } from "drizzle-orm";
const router = express.Router();
import profileRouter from "./profile";
import blockRouter from "./block";
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
import { deleteUserSchema } from "../../helpers/validations/user/delete";
import post from "../../helpers/db/selects/post";
import QueryValidationMiddleware from "../../helpers/middlewares/QueryValidation";
import z from "zod";
import { setCommentDetails } from "../../helpers/details/comment";
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

  const blocked = await db
    .select()
    .from(blockedUsersTable)
    .where(eq(blockedUsersTable.blockedBy, req.user.id));

  return res
    .status(200)
    .json({ user, blocked: blocked.map((block) => block.blockedUser) });
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
    const { email, password, newPassword, displayName } = req.body;
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
    if (displayName) update.displayName = displayName;

    if (Object.keys(update).length)
      await db.update(usersTable).set(update).where(eq(usersTable.id, user.id));

    res.status(200).json({ success: true });
    if (update.email) await createToken(update.email);
  }
);

router.delete(
  "/me",
  requireAuth,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, deleteUserSchema),
  async (req, res) => {
    const { password } = req.body;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.id));

    if (!ComparePassword(password, user.password))
      return res.status(401).json({
        success: false,
        message: "fail",
        errors: {
          password: ["Password is incorrect."],
        },
      });

    await db
      .update(usersTable)
      .set({
        displayName: "Deleted",
        email: null,
        emailVerified: false,
        status: "deleted",
        profilePicture: null,
        banner: null,
      })
      .where(eq(usersTable.id, user.id));

    await db
      .delete(communityMembersTable)
      .where(eq(communityMembersTable.userId, user.id));

    await db
      .delete(communitiesTable)
      .where(eq(communitiesTable.creator, user.id));

    return res.status(200).json({ success: true });
  }
);

router.get(
  "/me/saved",
  requireAuth,
  (req, res, next) =>
    QueryValidationMiddleware(
      req,
      res,
      next,
      z.object({
        offset: z
          .string()
          .transform((v) => parseInt(v))
          .optional(),
      })
    ),
  async (req, res) => {
    let { offset } = req.query;
    if (!offset) offset = "0";
    const saved = await db
      .select()
      .from(bookmarksTable)
      .where(eq(bookmarksTable.userId, req.user!.id));

    const posts = await db
      .select({ ...post, comments: count(commentsTable.relatedTo) })
      .from(commentsTable)
      .leftJoin(
        communityMembersTable,
        and(
          eq(communityMembersTable.communityId, commentsTable.communityId),
          eq(communityMembersTable.userId, req.user!.id)
        )
      )
      .leftJoin(
        communitiesTable,
        eq(communitiesTable.id, commentsTable.communityId)
      )
      .leftJoin(
        voteTable,
        and(
          eq(voteTable.commentId, commentsTable.id),
          eq(voteTable.userId, req.user!.id)
        )
      )
      .leftJoin(
        bookmarksTable,
        and(
          eq(bookmarksTable.postId, commentsTable.id),
          eq(bookmarksTable.userId, req.user!.id)
        )
      )
      .where(
        and(
          eq(commentsTable.post, true),
          eq(commentsTable.deleted, false),
          or(
            eq(communitiesTable.visibility, "public"),
            and(
              eq(communitiesTable.visibility, "private"),
              isNotNull(communityMembersTable.userId)
            )
          ),
          inArray(
            commentsTable.id,
            saved.map((s) => s.postId)
          )
        )
      )
      .orderBy(desc(bookmarksTable.createdAt))
      .groupBy(commentsTable.id)
      .limit(10)
      .offset(parseInt(offset as string));

    for (const comment of posts) {
      await setCommentDetails(comment);
      const [community] = await db
        .select()
        .from(communitiesTable)
        .where(eq(communitiesTable.id, comment.communityId!));
      (comment as any).community = community;
    }

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(commentsTable)
      .leftJoin(
        communityMembersTable,
        and(
          eq(communityMembersTable.communityId, commentsTable.communityId),
          eq(communityMembersTable.userId, req.user!.id)
        )
      )
      .leftJoin(
        communitiesTable,
        eq(communitiesTable.id, commentsTable.communityId)
      )
      .where(
        and(
          eq(commentsTable.post, true),
          eq(commentsTable.deleted, false),
          or(
            eq(communitiesTable.visibility, "public"),
            and(
              eq(communitiesTable.visibility, "private"),
              isNotNull(communityMembersTable.userId)
            )
          ),
          inArray(
            commentsTable.id,
            saved.map((s) => s.postId)
          )
        )
      );

    return res.status(200).json({
      posts: posts,
      pagination: {
        totalComments: total,
        currentPage: Math.floor(Number(offset) / 10) + 1,
        totalPages: Math.ceil(total / 10),
        itemsPerPage: 10,
        hasNextPage: Number(offset) + 10 < total,
        hasPreviousPage: Number(offset) > 0,
      },
    });
  }
);

router.use(profileRouter);
router.use(blockRouter);

export default router;
