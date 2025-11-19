import express from "express";
import { db } from "../../../database/db";
import {
  attachmentsTable,
  communitiesTable,
  communityMembersTable,
} from "../../../database";
import { and, eq, sql } from "drizzle-orm";
import getPermissions from "../../../helpers/permissions/getPermissions";
import { requireAuth } from "../../../helpers/middlewares/Auth";
import RequirePermission from "../../../helpers/middlewares/RequirePermission";
import BodyValidationMiddleware from "../../../helpers/middlewares/BodyValidation";
import { communityUpdateSchema } from "../../../helpers/validations/communities/update";
import CommentsRouter from "./comments";
import PostsRouter from "./posts";
import MembersRouter from "./members";
import { lower } from "../../../database/custom/lower";
import fileUpload, { UploadedFile } from "express-fileupload";
import FileValidationMiddleware from "../../../helpers/middlewares/FileValidation";
import S3 from "../../../cdn";
import { PutObjectCommand } from "@aws-sdk/client-s3";
const router = express.Router();
router.use(fileUpload({ safeFileNames: true }));

router.get("/:name", async (req, res) => {
  const [find] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, req.params.name));

  if (!find)
    return res
      .status(404)
      .json({ success: false, message: "Community not found." });
  if (find.visibility == "private") {
    if (!req.user?.id)
      return res
        .status(404)
        .json({ success: false, message: "Community not found." });
    const [member] = await db
      .select()
      .from(communityMembersTable)
      .where(
        and(
          eq(communityMembersTable.userId, req.user.id),
          eq(communityMembersTable.communityId, find.id)
        )
      );

    if (!member)
      return res
        .status(404)
        .json({ success: false, message: "Community not found." });
  }

  return res.status(200).json({
    ...find,
    ...{ permissions: await getPermissions(req.user?.id, find.id) },
  });
});

router.put(
  "/:name",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, communityUpdateSchema),
  async (req, res) => {
    const { name: communityName } = req.params;
    const { name, description, visibility } = req.body;
    if (name) {
      const [find] = await db
        .select()
        .from(communitiesTable)
        .where(eq(lower(communitiesTable.name), name.toLowerCase()));

      if (find)
        return res.status(400).json({
          succcess: false,
          message: "Name is taken",
          errors: {
            name: ["Community with this name already exists"],
          },
        });
    }
    await db
      .update(communitiesTable)
      .set({
        name,
        description,
        visibility,
      })
      .where(eq(communitiesTable.name, communityName));

    return res.status(200).json({ success: true });
  }
);

router.put(
  "/:name/icon",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    FileValidationMiddleware(req, res, next, "icon", {
      maxSize: 20 * 1024 * 1024,
      mimetype: "image/",
    }),
  async (req, res) => {
    const file = req.files?.icon as UploadedFile;
    const { name } = req.params;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(lower(communitiesTable.name), name.toLowerCase()));
    const uuid = crypto.randomUUID();
    const key = `/icons/${community.id}/${uuid}.${file.name.split(".").pop()}`;
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
      .update(communitiesTable)
      .set({
        icon: key.replace("/icons/", ""),
      })
      .where(eq(communitiesTable.id, community.id));

    await db.insert(attachmentsTable).values({
      uploadedBy: req.user?.id!,
      type: "icons",
      uuid,
      key,
    });

    return res.status(200).json({
      success: true,
      key,
    });
  }
);

router.use(CommentsRouter);
router.use(MembersRouter);
router.use(PostsRouter);

export default router;
