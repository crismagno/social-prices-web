"use client";

import Layout from '../../components/template/Layout/Layout';
import useLanguageData from '../../data/context/language/useLanguageData';
import { SalesBalance } from '../sales/components/SalesBalance/SalesBalance';
import { SalesChart } from '../sales/components/SalesChart/SalesChart';
import {
  SalesChartsStatistics,
} from '../sales/components/SalesChartsStatistics/SalesChartsStatistics';
import {
  DashboardOverview,
} from './components/DashboardOverview/DashboardOverview';

export default function DashboardPage() {
  const { t } = useLanguageData();
  return (
    <Layout subtitle={t("dashboard.subtitle")} title={t("dashboard.title")}>
      <DashboardOverview />

      <SalesBalance />

      <SalesChartsStatistics />

      <SalesChart cardClassName="mt-2" />
    </Layout>
  );
}
