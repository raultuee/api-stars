import { Schema, model, Model, Document } from "mongoose";

// Interface para o item do carrinho para garantir a tipagem
interface ICarrinhoItem {
    id_camiseta: string;
    slug?: string;
    tamanho: "P" | "M" | "G" | "GG";
    tipo_camiseta: "Oversized" | "Regular";
    preco: number;
}

// Interface principal que representa o documento do Pedido
// Adicionamos 'export' para que ela possa ser importada em outros arquivos
export interface IPedido extends Document {
  id: number;
  data_pedido: Date;
  nome_destinario: string;
  telefone_contato: string;
  cep: string;
  rua: string;
  numero: number;
  bairro: string;
  complemento?: string;
  forma_pagamento: "Cartão" | "PIX" | "Dinheiro";
  valor_total: number;
  itens: ICarrinhoItem[];
}

// Sub-schema para o item do carrinho
const CarrinhoItemSchema = new Schema<ICarrinhoItem>({
    id_camiseta: { type: String, required: true },
    slug: { type: String },
    tamanho: { 
        type: String, 
        enum: ["P", "M", "G", "GG"], 
        required: true 
    },
    tipo_camiseta: { 
        type: String, 
        enum: ["Oversized", "Regular"], 
        required: true 
    },
    preco: { type: Number, required: true }
});

const PedidoSchema = new Schema<IPedido>({
  id: { type: Number, unique: true },
  data_pedido: { type: Date, default: Date.now },
  nome_destinario: { type: String, required: true },
  telefone_contato: { type: String, required: true },
  cep: { type: String, required: true },
  rua: { type: String, required: true },
  numero: { type: Number, required: true },
  bairro: { type: String, required: true },
  complemento: { type: String },
  forma_pagamento: { 
    type: String, 
    enum: ["Cartão", "PIX", "Dinheiro"], 
    required: true 
  },
  valor_total: { type: Number, required: true },
  itens: {
    type: [CarrinhoItemSchema],
    required: true,
    validate: (v: any) => Array.isArray(v) && v.length > 0
  }
}, { 
  timestamps: true
});

// Middleware para gerar ID sequencial
PedidoSchema.pre<IPedido>('save', async function(next) {
  if (this.isNew) {
    const PedidoModel = this.constructor as Model<IPedido>;
    const lastPedido = await PedidoModel.findOne().sort({ id: -1 });
    this.id = lastPedido ? lastPedido.id + 1 : 1;
  }
  next();
});

export default model<IPedido>("Pedido", PedidoSchema);