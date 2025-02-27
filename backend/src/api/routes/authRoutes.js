// authRoutes.js
import express, { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import pool from '../../shared/db.js';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_super_secreta';

// Endpoint para cadastro (signup)
router.post('/signup', async (req, res) => {
    const { email, nickname, senha, classe } = req.body;
    if (!email || !nickname || !senha || !classe) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    try {
        // Verifica se já existe um usuário com mesmo email ou nickname
        const check = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1 OR nickname = $2',
            [email, nickname]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Usuário já existe.' });
        }

        // Gera o hash da senha
        const senha_hash = await bcrypt.hash(senha, 10);

        // Insere o usuário no banco
        const result = await pool.query(
            `INSERT INTO usuarios (email, nickname, senha_hash)
       VALUES ($1, $2, $3) RETURNING *`,
            [email, nickname, senha_hash]
        );
        const usuario = result.rows[0];

        const classesBaseStats = {
            guerreiro: {
                vida_base: 120,
                mana_base: 40,
                atributos: {
                    forca: 15,
                    destreza: 10,
                    inteligencia: 8,
                    vitalidade: 12,
                    defesa: 12,
                    sorte: 8
                }
            },
            mago: {
                vida_base: 70,
                mana_base: 120,
                atributos: {
                    forca: 6,
                    destreza: 8,
                    inteligencia: 15,
                    vitalidade: 8,
                    defesa: 8,
                    sorte: 12
                }
            },
            ladino: {
                vida_base: 80,
                mana_base: 60,
                atributos: {
                    forca: 8,
                    destreza: 15,
                    inteligencia: 10,
                    vitalidade: 8,
                    defesa: 8,
                    sorte: 12
                }
            },
            paladino: {
                vida_base: 110,
                mana_base: 70,
                atributos: {
                    forca: 12,
                    destreza: 8,
                    inteligencia: 10,
                    vitalidade: 12,
                    defesa: 15,
                    sorte: 8
                }
            },
            cacador: {
                vida_base: 85,
                mana_base: 55,
                atributos: {
                    forca: 10,
                    destreza: 15,
                    inteligencia: 10,
                    vitalidade: 10,
                    defesa: 8,
                    sorte: 10
                }
            },
            clerigo: {
                vida_base: 90,
                mana_base: 100,
                atributos: {
                    forca: 8,
                    destreza: 8,
                    inteligencia: 12,
                    vitalidade: 15,
                    defesa: 10,
                    sorte: 10
                }
            },
            mercenario: {
                vida_base: 85,
                mana_base: 50,
                atributos: {
                    forca: 10,
                    destreza: 12,
                    inteligencia: 8,
                    vitalidade: 10,
                    defesa: 8,
                    sorte: 15
                }
            },
            cavaleiro: {
                vida_base: 110,
                mana_base: 45,
                atributos: {
                    forca: 12,
                    destreza: 8,
                    inteligencia: 8,
                    vitalidade: 12,
                    defesa: 15,
                    sorte: 8
                }
            }
        };

        const classeStats = classesBaseStats[classe];
        const atributos = classeStats.atributos;

        // Cálculo de vida e mana
        const multiplicadorVida = 10;  // Cada ponto de vitalidade adiciona 10 de vida
        const multiplicadorMana = 10;  // Cada ponto de inteligência adiciona 10 de mana

        const vidaTotal = classeStats.vida_base + (atributos.vitalidade * multiplicadorVida);
        const manaTotal = classeStats.mana_base + (atributos.inteligencia * multiplicadorMana);

        // Insere os atributos do personagem com vida e mana
        await pool.query(
            `INSERT INTO personagens 
            (usuario_id, classe, nivel, xp_atual, prox_xp, 
             forca, destreza, inteligencia, vitalidade, defesa, sorte,
             vida, mana)
            VALUES 
            ($1, $2, 1, 0, 100, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                usuario.id,
                classe,
                atributos.forca,
                atributos.destreza,
                atributos.inteligencia,
                atributos.vitalidade,
                atributos.defesa,
                atributos.sorte,
                vidaTotal,
                manaTotal
            ]
        );

        res.status(201).json(usuario);
    } catch (err) {
        console.error('Erro no cadastro:', err);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

// Endpoint para login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Preencha e-mail e senha.' });
    }

    try {
        // Procura o usuário pelo email
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        const usuario = result.rows[0];
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Compara a senha informada com o hash armazenado
        const valid = await bcrypt.compare(senha, usuario.senha_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Gera um token JWT com validade de 7 dias
        const token = jwt.sign({
            id: usuario.id,
            email: usuario.email,
            nickname: usuario.nickname
        }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, usuario });
    } catch (error) {
        console.error('[Auth] Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

export default router;
