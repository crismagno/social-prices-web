"use client";

import { Select } from "antd";

import { GlobalOutlined } from "@ant-design/icons";

import { LanguageEnum } from "../../../data/context/language/LanguageContext";
import useLanguageData from "../../../data/context/language/useLanguageData";

const { Option } = Select;

interface LanguageOption {
  value: LanguageEnum;
  label: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { value: LanguageEnum.en, label: "English", flag: "🇺🇸" },
  { value: LanguageEnum.ptBR, label: "Português (BR)", flag: "🇧🇷" },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguageData()!;

  const handleChange = (value: LanguageEnum) => {
    setLanguage(value);
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 font-medium text-gray-700 dark:text-gray-300">
        <GlobalOutlined className="mr-2" />
        {t("settings.language")}
      </label>
      <Select
        value={language}
        onChange={handleChange}
        style={{ width: "100%" }}
        size="large"
        placeholder={t("settings.selectLanguage")}
      >
        {languages.map((lang) => (
          <Option key={lang.value} value={lang.value}>
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};
