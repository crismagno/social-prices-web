import { Card } from "antd";

import ContainerTitle from "../../components/common/ContainerTitle/ContainerTitle";
import Description from "../../components/common/Description/Description";
import Layout from "../../components/template/Layout/Layout";
import ThemeButton from "../../components/template/ThemeButton/ThemeButton";

export default function Settings() {
  return (
    <Layout subtitle="System settings" title="Settings to update system">
      <Card className=" h-min-80 mt-10">
        <ContainerTitle title="Layout" className="mt-6 text-base">
          <div className="flex">
            <Description
              label="Color Mode: "
              className="mr-5"
              description={<ThemeButton />}
            />
          </div>
        </ContainerTitle>
      </Card>
    </Layout>
  );
}
