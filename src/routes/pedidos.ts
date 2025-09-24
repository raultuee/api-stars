import { Router } from "express";
import Pedidos from "../models/Pedido";

const router = Router();

// Criar pedido
router.post("/", async (req, res) => {
  try {
    const {
      itens, // Agora a requisição espera um array de itens
      nome_destinario,
      telefone_contato,
      cep,
      rua,
      numero,
      bairro,
      complemento,
      forma_pagamento,
    } = req.body;

    // Validar campos obrigatórios, incluindo o array de itens
    if (!itens || itens.length === 0 || !nome_destinario || 
        !telefone_contato || !cep || !rua || !numero || !bairro || 
        !forma_pagamento) {
      return res.status(400).json({ 
        error: "Campos obrigatórios não preenchidos" 
      });
    }

    // Calcula o valor total a partir dos preços dos itens + frete
    const valor_total = itens.reduce((acc: number, item: any) => acc + item.preco, 0) + 10;

    const pedido = new Pedidos({
      itens,
      nome_destinario,
      telefone_contato,
      cep,
      rua,
      numero: Number(numero),
      bairro,
      complemento,
      forma_pagamento,
      valor_total
    });

    await pedido.save();
    
    res.status(201).json({
      message: "Pedido criado com sucesso!",
      pedido: pedido
    });
  } catch (err: any) {
    console.error('Erro ao criar pedido:', err);
    res.status(400).json({ 
      error: "Erro ao criar pedido",
      details: err.message 
    });
  }
});

// Listar todos os pedidos
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = status ? { status } : {};
    
    const pedidos = await Pedidos.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Pedidos.countDocuments(query);
    
    res.json({
      pedidos,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (err: any) {
    res.status(500).json({ 
      error: "Erro ao buscar pedidos",
      details: err.message 
    });
  }
});

// Buscar pedido por ID
router.get("/:id", async (req, res) => {
  try {
    const pedido = await Pedidos.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    
    res.json(pedido);
  } catch (err: any) {
    res.status(500).json({ 
      error: "Erro ao buscar pedido",
      details: err.message 
    });
  }
});

// Buscar pedidos por número do pedido (campo id)
router.get("/numero/:numero", async (req, res) => {
  try {
    const pedido = await Pedidos.findOne({ id: Number(req.params.numero) });
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    
    res.json(pedido);
  } catch (err: any) {
    res.status(500).json({ 
      error: "Erro ao buscar pedido",
      details: err.message 
    });
  }
});

// Buscar pedidos por telefone
router.get("/telefone/:telefone", async (req, res) => {
  try {
    const pedidos = await Pedidos.find({ 
      telefone_contato: req.params.telefone 
    }).sort({ createdAt: -1 });
    
    res.json(pedidos);
  } catch (err: any) {
    res.status(500).json({ 
      error: "Erro ao buscar pedidos",
      details: err.message 
    });
  }
});

// Atualizar pedido
router.put("/:id", async (req, res) => {
  try {
    const pedido = await Pedidos.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    
    res.json({
      message: "Pedido atualizado com sucesso!",
      pedido
    });
  } catch (err: any) {
    res.status(400).json({ 
      error: "Erro ao atualizar pedido",
      details: err.message 
    });
  }
});

// Deletar pedido
router.delete("/:id", async (req, res) => {
  try {
    const pedido = await Pedidos.findByIdAndDelete(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    
    res.json({ message: "Pedido removido com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ 
      error: "Erro ao remover pedido",
      details: err.message 
    });
  }
});

// Estatísticas básicas
router.get("/stats/resumo", async (req, res) => {
  try {
    const totalPedidos = await Pedidos.countDocuments();
    const valorTotal = await Pedidos.aggregate([
      { $group: { _id: null, total: { $sum: "$valor_total" } } }
    ]);
    
    const pedidosPorFormaPagamento = await Pedidos.aggregate([
      { $group: { _id: "$forma_pagamento", count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalPedidos,
      valorTotal: valorTotal[0]?.total || 0,
      pedidosPorFormaPagamento
    });
  } catch (err: any) {
    res.status(500).json({ 
      error: "Erro ao gerar estatísticas",
      details: err.message 
    });
  }
});

export default router;