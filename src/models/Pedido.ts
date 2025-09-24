import { Schema, model, Model } from "mongoose";

// Sub-schema para o item do carrinho
const CarrinhoItemSchema = new Schema({
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
    // cupom: { type: Boolean, default: false },
    preco: { type: Number, required: true }
});

const PedidoSchema = new Schema({
  // Pedido
  id: { type: Number, unique: true },
  data_pedido: { type: Date, default: Date.now },
  nome_destinario: { type: String, required: true },
  telefone_contato: { type: String, required: true },
  
  // Endereço
  cep: { type: String, required: true },
  rua: { type: String, required: true },
  numero: { type: Number, required: true },
  bairro: { type: String, required: true },
  complemento: { type: String },
  
  // Financeiro
  forma_pagamento: { 
    type: String, 
    enum: ["Cartão", "PIX", "Dinheiro"], 
    required: true 
  },
  valor_total: { type: Number, required: true },
  
  // ITENS DO PEDIDO (Novo array)
  itens: {
    type: [CarrinhoItemSchema],
    required: true,
    validate: (v: any) => Array.isArray(v) && v.length > 0
  }
}, { 
  timestamps: true
});

// Middleware para gerar ID sequencial
PedidoSchema.pre('save', async function(next) {
  const Pedido = this.constructor as Model<any>;

  if (this.isNew) {
    const lastPedido = await Pedido.findOne().sort({ id: -1 });
    this.id = lastPedido ? lastPedido.id + 1 : 1;
  }
  next();
});

export default model("Pedido", PedidoSchema);