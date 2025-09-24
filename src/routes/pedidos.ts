import { Router } from "express";
import Pedidos from "../models/Pedido";

const router = Router();

// Criar pedido
router.post("/", async (req, res) => {
  try {
    const {
      itens, // Recebe o array de itens do frontend
      nome_destinario,
      telefone_contato,
      cep,
      rua,
      numero,
      bairro,
      complemento,
      forma_pagamento,
      valor_total // Este valor total é para o pedido completo
    } = req.body;

    // Garante que o array de itens existe
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        error: "Nenhum item de pedido foi fornecido"
      });
    }

    const pedidosCriados = [];

    // Itera sobre o array de itens para salvar cada um separadamente
    for (const item of itens) {
      const pedido = new Pedidos({
        // Mapeia os dados do item para o esquema Pedido
        id_camiseta: item.id_camiseta,
        slug: item.slug,
        tamanho: item.tamanho,
        tipo_camiseta: item.tipo_camiseta,
        cupom: item.cupom || false, // 'cupom' pode não existir, então use um fallback
        nome_destinario,
        telefone_contato,
        cep,
        rua,
        numero: Number(numero),
        bairro,
        complemento,
        forma_pagamento,
        valor_total: item.preco // Salva o preço individual do item
      });

      // Salva o pedido no banco de dados
      await pedido.save();
      pedidosCriados.push(pedido);
    }
    
    res.status(201).json({
      message: "Pedidos criados com sucesso!",
      pedidos: pedidosCriados
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