import { Schema, model } from "mongoose";

const CupomSchema = new Schema({
  codigo: { type: String, required: true, unique: true },
  desconto: { type: Number, required: true }, // em %
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

export default model("Cupom", CupomSchema);
