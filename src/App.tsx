import React, { useEffect, useState } from 'react'
import './App.css'
import { getChartSale, getGroupedSales, getOrderAgents, interceptor, login } from './services';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Box, Button, Card, CardContent, CircularProgress, Container, CssBaseline, FormControl, Grid, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Swal from 'sweetalert2';
import { Agent } from './model/agent';
import { Sale } from './model/sale';
import { green } from '@mui/material/colors';
import { BarChart } from '@mui/x-charts';
import { ChartSale } from './model/chart';
import { Addchart } from '@mui/icons-material';

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsOriginal, setAgentsOriginal] = useState<Agent[]>([]);
  const [days, setDays] = useState("");
  const [period, setPeriod] = useState('');
  const [b2bB2c, setB2bB2c] = useState('null');
  const [loading, setLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [saleIndicator, setSaleIndicator] = useState<Sale | null>();
  const [chartSales, setChartSales] = useState<ChartSale[] | null>();
  const [typePlot, setTypePlot] = useState('total');
  const [typePeriod, setTypePeriod] = useState('current-year');
  const [labelSeriesCurrent, setLabelSeriesCurrent] = useState<string>('Ano atual');
  const [labelSeriesLast, setLabelSeriesLast] = useState<string>('Ano passado');
  const [labels, setLabels] = useState<string[]>([]);
  const [valueYearCurrentChartSale, setValueYearCurrentChartSale] = useState<number[]>([]);
  const [valueYearLastChartSale, setValueYearLastChartSale] = useState<number[]>([]);
  const [typePlotAcumulate, setTypePlotAcumulate] = useState('total');
  const [typePeriodAcumultate, setTypePeriodAcumulate] = useState('current-year');
  const [labelSeriesCurrentAcumulate, setLabelSeriesCurrentAcumulate] = useState<string>('Ano atual');
  const [labelSeriesLastAcumulate, setLabelSeriesLastAcumulate] = useState<string>('Ano passado');
  const [labelsAcumulate, setLabelsAcumulate] = useState<string[]>([]);
  const [valueYearCurrentChartSaleAcumultate, setValueYearCurrentChartSaleAcumulate] = useState<number[]>([]);
  const [valueYearLastChartSaleAcumultate, setValueYearLastChartSaleAcumulate] = useState<number[]>([]);

  useEffect(() => {
    interceptor();

    const getToken = async () => {
      const tokenSave = localStorage.getItem("token");
      if (tokenSave == undefined || tokenSave == null || tokenSave.length == 0) {
        const token = await login();
        if (token == undefined || token == null || token.length == 0) {
          Swal.fire({
            title: 'Error!',
            text: 'Ocorreu um erro ao fazer login na api!',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
      }
      orderAgents();
    };
    getToken();

    async function orderAgents() {
      const agentsResponse: Agent[] | null = await getOrderAgents();
      if (agentsResponse == undefined || agentsResponse == null || agentsResponse.length == 0) {
        Swal.fire({
          title: 'Error!',
          text: 'Ocorreu um erro ao buscar agentes!',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        setAgentsOriginal(agentsResponse.filter(agent => agent.agentCode != undefined && agent.agentCode != null));
        setAgents(agentsResponse.filter(agent => agent.agentCode != undefined && agent.agentCode != null));
      }
    }

    getDataChartSale();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    setDays(event.target.value as string);
  };


  const handleTextFieldPeriodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPeriod(event.target.value);
  };


  const handleChangeB2bB2c = (event: SelectChangeEvent) => {
    setB2bB2c(event.target.value as string);
    setValueAgent(event.target.value);
  };

  const [agent, setAgent] = useState("null");

  const handleChangeAgent = (event: SelectChangeEvent) => {
    setAgent(event.target.value as string);
    setValueB2bB2c(event.target.value);
  };

  const lenghtDays = () => {
    if (Number(days) == 1 || Number(days) == 2) {
      return <FormControl fullWidth>
        <label className='label-select'>Quantidade de dias</label>
        <TextField id="outlined-basic" type='number' value={period} onChange={handleTextFieldPeriodChange} InputProps={{ inputProps: { min: 1, max: 366 } }} />
      </FormControl>
    }
  }

  const setValueB2bB2c = (value: string) => {
    if (value !== undefined && value !== null && value.toString().trim().length > 0 && value !== "null") {
      if (Number(value) < 600) {
        setB2bB2c("b2b");
      } else {
        setB2bB2c("b2c");
      }
    }
  }

  const setValueAgent = (value: string) => {
    switch (value) {
      case "b2b":
        setAgents(agentsOriginal.filter(agent => agent.agentCode < 600));
        break;
      case "b2c":
        setAgents(agentsOriginal.filter(agent => agent.agentCode >= 600));
        break;
      default:
        setAgents(agentsOriginal);
        break;
    }
  }

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault();
    if (days == undefined || days == null || days.length == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Selecione o período!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else if ((Number(days) == 1 || Number(days) == 2) && (period == undefined || period == null || period.toString().trim().length == 0)) {
      Swal.fire({
        title: 'Error!',
        text: 'Preencha o campo quantidade de dias!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else if (Number(days) == 1 && Number(period) > geturrentDaysYearCurrent()) {
      Swal.fire({
        title: 'Error!',
        text: `O valor que você colocou de dias corridos está maior do que os dias corridos do ano atual que são ${geturrentDaysYearCurrent()}!`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else if (Number(days) == 2 && Number(period) > 366) {
      Swal.fire({
        title: 'Error!',
        text: `O valor que você colocou de dias corridos está maior do que os dias que se tem em um período de 1 ano!`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else {
      setLoading(true);
      getSaleIndicator();
    }
  }

  const geturrentDaysYearCurrent = (): number => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(currentYear, 0, 0); // Define a data de início do ano atual
    const diff = currentDate.getTime() - startOfYear.getTime(); // Calcula a diferença em milissegundos
    const oneDay = 1000 * 60 * 60 * 24; // Um dia em milissegundos
    return Math.floor(diff / oneDay);
  };

  const getDayToStruct = (): number => {
    if (Number(days) == 1 || Number(days) == 2) {
      return Number(period);
    }

    return Number(days);
  };

  const getB2bOrB2c = (value: string): boolean | undefined => {
    if (b2bB2c === undefined || b2bB2c === null || b2bB2c.length == 0 || b2bB2c === "null") {
      return true;
    }
    return value === b2bB2c ? true : undefined;
  };

  const getSaleIndicator = async () => {
    const saleResponse: Sale | null = await getGroupedSales(getDayToStruct(), getB2bOrB2c("b2b"), getB2bOrB2c("b2c"), agent == "null" ? undefined : Number(agent));
    setLoading(false);
    if (saleResponse == undefined || saleResponse == null) {
      Swal.fire({
        title: 'Error!',
        text: 'Ocorreu um erro ao buscar agentes!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setSaleIndicator(undefined);
    } else {
      setSaleIndicator(saleResponse);
    }
  };

  const handleChangeTypePlot = (event: SelectChangeEvent) => {
    setTypePlot(event.target.value as string);
  };

  const handleChangeTypePeriod = (event: SelectChangeEvent) => {
    setTypePeriod(event.target.value as string);
  };

  const monthchartSale = (event: React.FormEvent) => {
    event.preventDefault();
    if (chartSales != undefined && chartSales != null && chartSales.length > 0) {
      formatDataChartSale(chartSales);
    }
  };

  const handleChangeTypePlotAcumulate = (event: SelectChangeEvent) => {
    setTypePlotAcumulate(event.target.value as string);
  };

  const handleChangeTypePeriodAcumulate = (event: SelectChangeEvent) => {
    setTypePeriodAcumulate(event.target.value as string);
  };

  const monthchartSaleAcumulate = (event: React.FormEvent) => {
    event.preventDefault();
    if (chartSales != undefined && chartSales != null && chartSales.length > 0) {
      formatDataChartSaleAcumulate(chartSales);
    }
  };

  const checkColorPercentage = (value1: number | undefined, value2: number | undefined): string => {
    if (value1 == undefined) {
      value1 = 0;
    }

    if (value2 == undefined) {
      value2 = 0;
    }

    if (value1 > value2) {
      return "increase";
    } else if (value1 < value2) {
      return "miss";
    }

    return "equal";
  }

  const calculatePercentage = (value1: number | undefined, value2: number | undefined): number => {
    if (value1 == undefined) {
      value1 = 0;
    }

    if (value2 == undefined) {
      value2 = 0;
    }

    const difference = Math.abs(value1 - value2); // Calcula a diferença absoluta entre os valores
    const baseValue = Math.min(value1, value2); // Define o valor base para o cálculo da porcentagem

    if (baseValue === 0) {
      return 0;
    }

    return Math.round((difference / baseValue) * 100);

  };

  const getDataChartSale = async () => {
    setLoadingChart(true);
    const chartResponse: ChartSale[] | null = await getChartSale(getB2bOrB2c("b2b"), getB2bOrB2c("b2c"), agent == "null" ? undefined : Number(agent));
    setLoadingChart(false);
    if (chartResponse == undefined || chartResponse == null) {
      Swal.fire({
        title: 'Error!',
        text: 'Ocorreu um erro ao buscar agentes!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setChartSales(undefined);
    } else {
      setChartSales(chartResponse);
      formatDataChartSale(chartResponse);
      formatDataChartSaleAcumulate(chartResponse);
    }
  };

  const formatDataChartSale = (chartResponse: ChartSale[]) => {
    setValueYearCurrentChartSale([]);
    setValueYearLastChartSale([]);
    setLabels([]);
    if (typePeriod === "current-year") {
      setLabelSeriesCurrent(new Date().getFullYear().toString());
      setLabelSeriesLast((new Date().getFullYear() - 1).toString());

      for (let i = 1; i <= 12; i++) {
        const chartSaleCurrentYear: ChartSale[] = chartResponse.filter(chart => chart.year === new Date().getFullYear() && chart.month == i);
        const chartSaleLastYear: ChartSale[] = chartResponse.filter(chart => chart.year === new Date().getFullYear() - 1 && chart.month == i);

        if (chartSaleCurrentYear.length == 0) {
          setValueYearCurrentChartSale(prevArray => [...prevArray, 0]);
        } else {
          setValueYearCurrentChartSale(prevArray => [...prevArray, typePlot == "total" ? chartSaleCurrentYear[0].total : chartSaleCurrentYear[0].pairs]);
        }

        if (chartSaleLastYear.length == 0) {
          setValueYearLastChartSale(prevArray => [...prevArray, 0]);
        } else {
          setValueYearLastChartSale(prevArray => [...prevArray, typePlot == "total" ? chartSaleLastYear[0].total : chartSaleLastYear[0].pairs]);
        }

        setLabels(preventArray => [...preventArray, formatMonth(i)]);
      }
    } else {
      setLabelSeriesCurrent("Últimos 12 meses");
      setLabelSeriesLast("Entre 13ª e 24ª mês");

      const chartSaleSort: ChartSale[] = chartResponse.sort((a, b) => {
        if (a.year > b.year) return -1;
        if (a.year < b.year) return 1;

        if (a.month > b.month) return -1;
        if (a.month < b.month) return 1;
        return 0;
      });

      const chartSaleCompare: ChartSale[] = chartSaleSort.slice(0, 24);

      for (let i = 11; i >= 0; i--) {
        const chartSaleMonth: ChartSale[] = chartSaleCompare.filter(chart => chart.month == chartSaleCompare[i].month);

        setValueYearCurrentChartSale(prevArray => [...prevArray, typePlot == "total" ? chartSaleCompare[i].total : chartSaleCompare[i].pairs]);
        setValueYearLastChartSale(prevArray => [...prevArray, typePlot == "total" ? chartSaleMonth[1].total : chartSaleMonth[1].pairs]);
        setLabels(preventArray => [...preventArray, formatMonth(chartSaleCompare[i].month)]);
      }
    }
  };

  const formatDataChartSaleAcumulate = (chartResponse: ChartSale[]) => {
    setValueYearCurrentChartSaleAcumulate([]);
    setValueYearLastChartSaleAcumulate([]);
    setLabelsAcumulate([]);
    let sumChartSaleCurrentYear: number[];
    let sumChartSaleLastYear: number[];
    let sumCurrent: number;
    let sumLast: number;
    if (typePeriodAcumultate === "current-year") {
      sumChartSaleCurrentYear = [];
      sumChartSaleLastYear = [];
      sumCurrent = 0;
      sumLast = 0;
      setLabelSeriesCurrentAcumulate(new Date().getFullYear().toString());
      setLabelSeriesLastAcumulate((new Date().getFullYear() - 1).toString());

      for (let i = 1; i <= 12; i++) {
        const chartSaleCurrentYear: ChartSale[] = chartResponse.filter(chart => chart.year === new Date().getFullYear() && chart.month == i);
        const chartSaleLastYear: ChartSale[] = chartResponse.filter(chart => chart.year === new Date().getFullYear() - 1 && chart.month == i);

        if (chartSaleCurrentYear.length == 0) {
          sumChartSaleCurrentYear.push(sumCurrent);
        } else {
          sumCurrent += typePlotAcumulate == "total" ? chartSaleCurrentYear[0].total : chartSaleCurrentYear[0].pairs
          sumChartSaleCurrentYear.push(sumCurrent);
        }

        if (chartSaleLastYear.length == 0) {
          sumChartSaleLastYear.push(sumLast);
        } else {
          sumLast += typePlotAcumulate == "total" ? chartSaleLastYear[0].total : chartSaleLastYear[0].pairs
          sumChartSaleLastYear.push(sumLast);
        }

        setLabelsAcumulate(preventArray => [...preventArray, formatMonth(i)]);
      }

      setValueYearCurrentChartSaleAcumulate(sumChartSaleCurrentYear);
      setValueYearLastChartSaleAcumulate(sumChartSaleLastYear);
    } else {
      setLabelSeriesCurrentAcumulate("Últimos 12 meses");
      setLabelSeriesLastAcumulate("Entre 13ª e 24ª mês");
      sumChartSaleCurrentYear = [];
      sumChartSaleLastYear = [];
      sumCurrent = 0;
      sumLast = 0;

      const chartSaleSort: ChartSale[] = chartResponse.sort((a, b) => {
        if (a.year > b.year) return -1;
        if (a.year < b.year) return 1;

        if (a.month > b.month) return -1;
        if (a.month < b.month) return 1;
        return 0;
      });

      const chartSaleCompare: ChartSale[] = chartSaleSort.slice(0, 24);

      for (let i = 11; i >= 0; i--) {
        const chartSaleMonth: ChartSale[] = chartSaleCompare.filter(chart => chart.month == chartSaleCompare[i].month);

        sumCurrent += typePlotAcumulate == "total" ? chartSaleCompare[i].total : chartSaleCompare[i].pairs;
        sumChartSaleCurrentYear.push(sumCurrent);
        sumLast += typePlotAcumulate == "total" ? chartSaleMonth[1].total : chartSaleMonth[1].pairs;
        sumChartSaleLastYear.push(sumLast);
        setLabelsAcumulate(preventArray => [...preventArray, formatMonth(chartSaleCompare[i].month)]);
      }

      setValueYearCurrentChartSaleAcumulate(sumChartSaleCurrentYear);
      setValueYearLastChartSaleAcumulate(sumChartSaleLastYear);
    }
  };

  const formatMonth = (month: number): string => {
    switch (month) {
      case 1:
        return "Janeiro";
      case 2:
        return "Fevereiro";
      case 3:
        return "Março";
      case 4:
        return "Abril";
      case 5:
        return "Maio";
      case 6:
        return "Junho";
      case 7:
        return "Julho";
      case 8:
        return "Agosto";
      case 9:
        return "Setembro";
      case 10:
        return "Outubro";
      case 11:
        return "Novembro";
      case 12:
        return "Dezembro";

      default:
        return new Date().getFullYear().toString();
    }
  }

  const cardPeriod = (
    <React.Fragment>
      <CardContent>
        <h3 className='text-align-center'>Filtros</h3>
        <form onSubmit={submitForm}>
          <Grid container direction="row" spacing={2}>
            <Grid item xs={4}>
              <label className='label-select'>Período</label>
              <FormControl fullWidth>
                <Select
                  id="filterPeriod"
                  value={days}
                  onChange={handleChange}
                >
                  <MenuItem value={7}>7</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                  <MenuItem value={90}>90</MenuItem>
                  <MenuItem value={1}>Dias corridos do ano atual</MenuItem>
                  <MenuItem value={2}>Quantidade de dias do período de 1 ano</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <label className='label-select'>B2B/B2C</label>
                <Select
                  id="filterB2bB2c"
                  value={b2bB2c}
                  onChange={handleChangeB2bB2c}
                >
                  <MenuItem value={'null'}>Ambos</MenuItem>
                  <MenuItem value={'b2b'}>B2B</MenuItem>
                  <MenuItem value={'b2c'}>B2C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <label className='label-select'>Representantes</label>
                <Select
                  id="filterAgent"
                  value={agent}
                  onChange={handleChangeAgent}
                >
                  <MenuItem value={"null"}>Nenhum</MenuItem>
                  {agents.map(agent => (
                    <MenuItem key={agent.agentCode} value={agent.agentCode}>{agent.agentName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              {lenghtDays()}
            </Grid>
            <Grid item xs={12}>
              <div className='float-right'>
                <Button type='submit' variant="contained" color="success">
                  <SearchIcon fontSize="small" /> Filtrar
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </React.Fragment>
  );

  const cardSaleIndicator = (
    <React.Fragment>
      <CardContent>
        <h3 className='text-align-center'>Indicador venda</h3>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12}>
            {loading == true ? (
              <div className='text-align-center'>
                <CircularProgress
                  size={68}
                  sx={{
                    color: green[500]
                  }}
                />
              </div>
            ) :
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="spanning table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Descrição</TableCell>
                      <TableCell align="center">Atual</TableCell>
                      <TableCell align="center">Périodo passado</TableCell>
                      <TableCell align="center">Comparativo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center">Quantidade vendas</TableCell>
                      <TableCell align="center">{saleIndicator?.current.quantityOfOrders}</TableCell>
                      <TableCell align="center">{saleIndicator?.lastPeriod.quantityOfOrders}</TableCell>
                      <TableCell align="center">
                        <span className={checkColorPercentage(saleIndicator?.current.quantityOfOrders, saleIndicator?.lastPeriod.quantityOfOrders)}>
                          {calculatePercentage(saleIndicator?.current.quantityOfOrders, saleIndicator?.lastPeriod.quantityOfOrders)}%
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center">Quantidade prdutos vendidos</TableCell>
                      <TableCell align="center">{saleIndicator?.current.itemsSold}</TableCell>
                      <TableCell align="center">{saleIndicator?.lastPeriod.itemsSold}</TableCell>
                      <TableCell align="center">
                        <span className={checkColorPercentage(saleIndicator?.current.itemsSold, saleIndicator?.lastPeriod.itemsSold)}>
                          {calculatePercentage(saleIndicator?.current.itemsSold, saleIndicator?.lastPeriod.itemsSold)}%
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center">Total de produtos vendidosS</TableCell>
                      <TableCell align="center">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleIndicator?.current.ordersValue === undefined ? 0 : saleIndicator?.current.ordersValue)}</TableCell>
                      <TableCell align="center">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleIndicator?.lastPeriod.ordersValue === undefined ? 0 : saleIndicator?.lastPeriod.ordersValue)}</TableCell>
                      <TableCell align="center">
                        <span className={checkColorPercentage(saleIndicator?.current.ordersValue, saleIndicator?.lastPeriod.ordersValue)}>
                          {calculatePercentage(saleIndicator?.current.ordersValue, saleIndicator?.lastPeriod.ordersValue)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            }
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );

  const cardChartSaleMonth = (
    <React.Fragment>
      <CardContent>
        <h3 className='text-align-center'>Gráfico vendas</h3>
        <form onSubmit={monthchartSale}>
          <Grid container direction="row" spacing={2}>
            <Grid item xs={5}>
              <label className='label-select'>Ordenação</label>
              <FormControl fullWidth>
                <Select
                  id="typePlot"
                  value={typePlot}
                  onChange={handleChangeTypePlot}
                >
                  <MenuItem value={'total'}>Total em R$</MenuItem>
                  <MenuItem value={'pairs'}>Pares</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={5}>
              <FormControl fullWidth>
                <label className='label-select'>Período</label>
                <Select
                  id="typePlot"
                  value={typePeriod}
                  onChange={handleChangeTypePeriod}
                >
                  <MenuItem value={'current-year'}>Ano atual</MenuItem>
                  <MenuItem value={'last-twelve-months'}>Últimos 12 meses</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <div className='btn-filter-chart'>
                <Button className='btn-height' type='submit' variant="contained" color="info">
                  <Addchart fontSize="small" />
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
        <Grid item xs={12}>
          {loadingChart == true ? (
            <div className='text-align-center margin-top-30'>
              <CircularProgress
                size={68}
                sx={{
                  color: green[500]
                }}
              />
            </div>
          ) :
            <BarChart
              height={400}
              series={[
                { data: valueYearCurrentChartSale, label: labelSeriesCurrent, id: 'pvId' },
                { data: valueYearLastChartSale, label: labelSeriesLast, id: 'uvId' },
              ]}
              xAxis={[{ data: labels, scaleType: 'band' }]}
              margin={{ top: 30, bottom: 30, left: 80, right: 10 }}
            />
          }
        </Grid>
      </CardContent>
    </React.Fragment>
  );

  const cardChartSaleMonthAcumulate = (
    <React.Fragment>
      <CardContent>
        <h3 className='text-align-center'>Gráfico vendas acumulada</h3>
        <form onSubmit={monthchartSaleAcumulate}>
          <Grid container direction="row" spacing={2}>
            <Grid item xs={5}>
              <label className='label-select'>Ordenação</label>
              <FormControl fullWidth>
                <Select
                  id="typePlotAcumulate"
                  value={typePlotAcumulate}
                  onChange={handleChangeTypePlotAcumulate}
                >
                  <MenuItem value={'total'}>Total em R$</MenuItem>
                  <MenuItem value={'pairs'}>Pares</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={5}>
              <FormControl fullWidth>
                <label className='label-select'>Período</label>
                <Select
                  id="typePeriodAcumultate"
                  value={typePeriodAcumultate}
                  onChange={handleChangeTypePeriodAcumulate}
                >
                  <MenuItem value={'current-year'}>Ano atual</MenuItem>
                  <MenuItem value={'last-twelve-months'}>Últimos 12 meses</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <div className='btn-filter-chart'>
                <Button className='btn-height' type='submit' variant="contained" color="info">
                  <Addchart fontSize="small" />
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12}>
            {loadingChart == true ? (
              <div className='text-align-center margin-top-30'>
                <CircularProgress
                  size={68}
                  sx={{
                    color: green[500]
                  }}
                />
              </div>
            ) :
              <BarChart
                height={400}
                series={[
                  { data: valueYearCurrentChartSaleAcumultate, label: labelSeriesCurrentAcumulate, id: 'pvAcumlateId' },
                  { data: valueYearLastChartSaleAcumultate, label: labelSeriesLastAcumulate, id: 'uvAcumulateId' },
                ]}
                xAxis={[{ data: labelsAcumulate, scaleType: 'band' }]}
                margin={{ top: 30, bottom: 30, left: 80, right: 10 }}
              />
            }
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );

  return (
    <>
      <CssBaseline />
      <Container maxWidth="xl">
        <div>
          <h1 className='text-align-center'>Dashboard Vendas</h1>
        </div>
        <div className='margin-bottom-10'>
          <Box sx={{ minWidth: 50 }}>
            <Card variant="outlined">{cardPeriod}</Card>
          </Box>
        </div>
        {saleIndicator != undefined && saleIndicator != null && (
          <div className='margin-bottom-10'>
            <Box sx={{ minWidth: 50 }}>
              <Card variant="outlined">{cardSaleIndicator}</Card>
            </Box>
          </div>
        )}
        {chartSales != undefined && chartSales != null && chartSales.length > 0 && (
          <>
            <div className='margin-bottom-10'>
              <Box sx={{ minWidth: 50 }}>
                <Card variant="outlined">{cardChartSaleMonth}</Card>
              </Box>
            </div>
            <div className='margin-bottom-10'>
              <Box sx={{ minWidth: 50 }}>
                <Card variant="outlined">{cardChartSaleMonthAcumulate}</Card>
              </Box>
            </div>
          </>
        )}
      </Container>
      <footer className='footer'>
        <div className='content-footer'>
          <span>Desenvolvido em 2024 por Francisco Amaral - franciscosanamaral@hotmail.com</span>
        </div>
      </footer>

    </>
  )
}

export default App
