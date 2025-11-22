import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import CanAccessCommunity from "../../../../helpers/middlewares/CanAccessCommunity";
import { db } from "../../../../database/db";
import { attachmentsTable, communitiesTable } from "../../../../database";
import { eq } from "drizzle-orm";
import { UploadedFile } from "express-fileupload";
import FileValidationMiddleware from "../../../../helpers/middlewares/FileValidation";
import S3 from "../../../../cdn";
import { PutObjectCommand } from "@aws-sdk/client-s3";
const router = express.Router();

router.post(
  "/:name/attachments",
  requireAuth,
  CanAccessCommunity,
  (req, res, next) =>
    FileValidationMiddleware(req, res, next, "attachment", {
      maxSize: 20 * 1024 * 1024,
      mimetype: "image/",
    }),
  async (req, res) => {
    const { name } = req.params;
    const attachment = req.files?.attachment as UploadedFile;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const uuid = crypto.randomUUID();
    const key = `attachments/${community.id}/${
      req.user?.id
    }/${uuid}.${attachment.mimetype.replace("image/", "")}`;

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: attachment.data,
        ContentType: attachment.mimetype,
        ACL: "public-read",
      })
    );

    const [{ id }] = await db
      .insert(attachmentsTable)
      .values({
        uploadedBy: req.user?.id!,
        type: "attachments",
        uuid,
        key,
      })
      .$returningId();

    return res
      .status(200)
      .json({ success: true, key: key.replace("attachments/", ""), id });
  }
);

export default router;
