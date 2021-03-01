import { Request, Response } from 'express';
import knex from '../database/connect';
import moment from 'moment';

interface IRegras {
    id_regra: number,
    nome_regra: string,
    qtd_dias_inicial: number;
    qtd_dias_final: number; 
    qtd_multa: number;
    qtd_juros: number;
}

interface IContas {
    id_conta: number;
    nome_conta: string;
    data_vencimento: string;
    data_pagamento: string;
    valor_original: number;
    diferenca_dias: number;
    id_regra: number;
    tipo_juros: 'simples' | 'composto';
    nome_regra: string;
    qtd_dias_inicial: number;
    qtd_dias_final: number;
    qtd_multa: number;
    qtd_juros: number;
}

export async function showContas (req: Request, res: Response) {
    try {
        const contas:IContas[] = await knex('contas')
            .select('contas.id_conta', 'contas.nome_conta', 'contas.data_vencimento', 'contas.data_pagamento', 
                    'contas.valor_original', 'contas.valor_final', 'contas.diferenca_dias', 'contas.id_regra', 
                    'contas.tipo_juros', 'regras_atraso.nome_regra', 'regras_atraso.qtd_dias_inicial',
                    'regras_atraso.qtd_dias_final', 'regras_atraso.qtd_multa', 'regras_atraso.qtd_juros')
            .leftJoin('regras_atraso', 'contas.id_regra', 'regras_atraso.id_regra');

        if (contas?.length < 1) return res.status(204).json({msg: 'Nenhuma conta encontrada.', contas});

        return res.status(200).json({ msg: 'Contas encontradas com sucesso.', contas });
    } catch(e) {
        if (e?.code === 'ECONNREFUSED'){
            return res.status(503).json({msg:'Falha na comunicação com o banco de dados. Tente novamente.'});
        }

        return res.status(500).json({msg: 'Erro ao buscar contas.', error: e});
    }
}

export async function createConta (req: Request, res: Response) {
    try {
        const { nome_conta, valor_original, data_vencimento, data_pagamento, tipo_juros } = req.body;
        // const regras:IRegras[] = await knex('regras_atraso')
        //     .select('id_regra', 'qtd_dias_inicial', 'qtd_dias_final', 'qtd_multa', 'qtd_juros');
        const diferenca_dias = moment(data_pagamento, 'YYYY-MM-DD').diff(moment(data_vencimento, 'YYYY-MM-DD'), 'days');
        let valor_final = valor_original;
        // const regra_aplicada:IRegras[] = regras.filter( regra => {
        //     if(!regra.qtd_dias_final) regra.qtd_dias_final = Infinity;
        //     return regra.qtd_dias_inicial < diferenca_dias && regra.qtd_dias_final >= diferenca_dias;
        // });
        const regra_aplicada = await verifica_regra(diferenca_dias);

        if(regra_aplicada){
            switch (tipo_juros){
                case 'composto':
                    valor_final = calcula_composto(valor_original, regra_aplicada.qtd_juros, regra_aplicada.qtd_multa, diferenca_dias);
                break;
                default:
                    valor_final = calcula_simples(valor_original, regra_aplicada.qtd_juros, regra_aplicada.qtd_multa, diferenca_dias);
                break;
            }
        }

        const id_regra = regra_aplicada ? regra_aplicada.id_regra : undefined;
        const transact = await knex.transaction();
        const insert = await transact('contas').insert({
            nome_conta, 
            valor_original, 
            data_vencimento, 
            data_pagamento, 
            diferenca_dias,
            valor_final,
            id_regra,
            tipo_juros
        });

        await transact.commit();

        return res.status(200).json({
            msg: 'Conta cadastrada com sucesso.',
            id_conta: insert[0]
        });
    } catch (e) {
        if (e?.code === 'ECONNREFUSED'){
            return res.status(503).json({msg:'Falha na comunicação com o banco de dados. Tente novamente.'});
        }

        if (e && e.errno) {
            return res.status(400).json({msg: 'Verifique os dados enviados.', error: e.sqlMessage ? e.sqlMessage : 'desconhecido'});
        }

        return res.status(500).json({msg: 'Erro ao cadastrar conta.', error : e});
    }
}

export function calcula_composto(valor_original: number, qtd_juros: number, qtd_multa: number, diferenca_dias: number):string {
    let valor_final = valor_original * ( Math.pow( 1 + ( qtd_juros / 100 ) , diferenca_dias ) );
    valor_final += ( valor_original * qtd_multa ) / 100;
    return valor_final.toFixed(2);
}

export function calcula_simples(valor_original: number, qtd_juros: number, qtd_multa: number, diferenca_dias: number):string {
    let valor_final = valor_original + ( ( ( valor_original * qtd_juros) / 100 ) * diferenca_dias);
    valor_final += ( valor_original * qtd_multa ) / 100;
    return valor_final.toFixed(2);
}

export async function verifica_regra(diferenca_dias: number):Promise<IRegras | undefined> {
    const regras:IRegras[] = await knex('regras_atraso')
            .select('id_regra', 'nome_regra', 'qtd_dias_inicial', 'qtd_dias_final', 'qtd_multa', 'qtd_juros');
    const regra_aplicada = regras.filter( regra => {
        if(!regra.qtd_dias_final) regra.qtd_dias_final = Infinity;
        return regra.qtd_dias_inicial < diferenca_dias && regra.qtd_dias_final >= diferenca_dias;
    });
    return regra_aplicada.length > 0 ? regra_aplicada[0] : undefined;
}