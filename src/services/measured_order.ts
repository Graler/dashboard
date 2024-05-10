import axios from "axios"
import { Agent } from "../model/agent";
import { Sale } from "../model/sale";
import { ChartSale } from "../model/chart";

const baseUrl: string = import.meta.env.VITE_BASE_URL;

export const getOrderAgents = async (): Promise<Agent[] | null> => {
  try {
    const response = await axios.get<Agent[]>(`${baseUrl}/measured_order/order_agents`);
    const agent: Agent[] = response.data;
    return agent;
  } catch (error) {
    console.error('Erro ao buscar agente');
    console.error(error);
    return null;
  }
};

export const getGroupedSales = async (daysToSubtract: number, b2b: boolean | undefined, b2c: boolean | undefined, agentCode: number | undefined): Promise<Sale | null> => {
  try {
    const params = {
      days_to_subtract: daysToSubtract,
      b2b: b2b,
      b2c: b2c,
      agent_code: agentCode
    }

    const response = await axios.get<Sale>(`${baseUrl}/measured_order/grouped_sales`, { params });
    const sale: Sale = response.data;
    return sale;
  } catch (error) {
    console.error('Erro ao buscar grupo de vendas');
    console.error(error);
    return null;
  }
};

export const getChartSale = async (b2b: boolean | undefined, b2c: boolean | undefined, agentCode: number | undefined): Promise<ChartSale[] | null> => {
  try {
    const params = {
      b2b: b2b,
      b2c: b2c,
      agent_code: agentCode
    }

    const response = await axios.get<ChartSale[]>(`${baseUrl}/measured_order/sales_by_month`, { params });
    const chartSale: ChartSale[] = response.data;
    return chartSale;
  } catch (error) {
    console.error('Erro ao buscar vendas para gráfico');
    console.error(error);
    return null;
  }
};