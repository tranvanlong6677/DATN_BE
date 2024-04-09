import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PermissionDocument =
  HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  apiPath: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  module: string;

  @Prop()
  created_at: Date;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  updated_at: Date;

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
}
export const PermissionSchema =
  SchemaFactory.createForClass(Permission);
