"use client";

import { useEffect, useState } from "react";

import { App, Button, Card, Form, Input, Select, Space, Switch } from "antd";

import { FontSizeOutlined, PaperClipOutlined } from "@ant-design/icons";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IEmployee } from "../../shared/business/employees/employee.interface";
import QuickMessagesEnum from "../../shared/business/quick-messages/quick-messages.enum";
import {
  IQuickMessage,
  IQuickMessageBlock,
  IQuickMessageBlockInput,
  IQuickMessageFieldInfo,
} from "../../shared/business/quick-messages/quick-messages.types";
import QuickMessageBlockEditor, {
  IEditorBlock,
} from "./QuickMessageBlockEditor";

interface Props {
  initial?: IQuickMessage;
  onSaved: () => void;
}

let uidSeed: number = 0;

const newUid = (): string => `b${++uidSeed}`;

const emptyBlock = (type: QuickMessagesEnum.BlockType): IEditorBlock => ({
  uid: newUid(),
  type,
  text: "",
  caption: "",
  file: null,
  kept: null,
});

const toEditorBlock = (block: IQuickMessageBlock): IEditorBlock =>
  block.type === QuickMessagesEnum.BlockType.TEXT
    ? { ...emptyBlock(block.type), text: block.text }
    : {
        ...emptyBlock(block.type),
        caption: block.caption ?? "",
        kept: block,
      };

// What is missing before the message can be saved, as a translation key.
const problemOf = (name: string, blocks: IEditorBlock[]): string | null => {
  if (!name.trim()) {
    return "quickMessages.errors.name";
  }

  const incomplete: boolean = blocks.some((block: IEditorBlock) =>
    block.type === QuickMessagesEnum.BlockType.TEXT
      ? !block.text.trim()
      : !block.file && !block.kept,
  );

  return incomplete ? "quickMessages.errors.incompleteBlock" : null;
};

// Creates or edits a quick message: its name, its blocks in order, and who may use it.
export default function QuickMessageEditor({ initial, onSaved }: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const [name, setName] = useState<string>(initial?.name ?? "");

  const [blocks, setBlocks] = useState<IEditorBlock[]>(
    initial?.blocks?.length
      ? initial.blocks.map(toEditorBlock)
      : [emptyBlock(QuickMessagesEnum.BlockType.TEXT)],
  );

  const [allEmployees, setAllEmployees] = useState<boolean>(
    initial?.allEmployees ?? true,
  );

  const [employeesIds, setEmployeesIds] = useState<string[]>(
    initial?.employeesIds ?? [],
  );

  const [employees, setEmployees] = useState<IEmployee[]>([]);

  const [fields, setFields] = useState<IQuickMessageFieldInfo[]>([]);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    serviceMethodsInstance.quickMessagesServiceMethods
      .listFields()
      .then(setFields)
      .catch(handleClientError);

    serviceMethodsInstance.employeesServiceMethods
      .findByUser()
      .then(setEmployees)
      .catch(handleClientError);
  }, []);

  const change = (index: number, block: IEditorBlock): void =>
    setBlocks((current) =>
      current.map((item, i) => (i === index ? block : item)),
    );

  const move = (index: number, direction: -1 | 1): void =>
    setBlocks((current) => {
      const next: IEditorBlock[] = [...current];

      const target: number = index + direction;

      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });

  const remove = (index: number): void =>
    setBlocks((current) => current.filter((_, i) => i !== index));

  const add = (type: QuickMessagesEnum.BlockType): void =>
    setBlocks((current) => [...current, emptyBlock(type)]);

  const save = async (): Promise<void> => {
    const problem: string | null = problemOf(name, blocks);

    if (problem) {
      message.warning(t(problem));

      return;
    }

    const files: File[] = [];

    const inputs: IQuickMessageBlockInput[] = blocks.map(
      (block: IEditorBlock): IQuickMessageBlockInput => {
        if (block.type === QuickMessagesEnum.BlockType.TEXT) {
          return { type: block.type, text: block.text };
        }

        if (block.file) {
          files.push(block.file);

          return {
            type: block.type,
            caption: block.caption,
            fileIndex: files.length - 1,
          };
        }

        return {
          type: block.type,
          caption: block.caption,
          fileKey: block.kept?.fileKey,
        };
      },
    );

    const data = {
      name: name.trim(),
      allEmployees,
      employeesIds: allEmployees ? [] : employeesIds,
      blocks: inputs,
    };

    try {
      setIsSaving(true);

      if (initial) {
        await serviceMethodsInstance.quickMessagesServiceMethods.update(
          initial._id,
          data,
          files,
        );
      } else {
        await serviceMethodsInstance.quickMessagesServiceMethods.create(
          data,
          files,
        );
      }

      message.success(t("quickMessages.saved"));

      onSaved();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFull: boolean = blocks.length >= QuickMessagesEnum.MAX_BLOCKS;

  return (
    <Card className="mt-5">
      <Form layout="vertical">
        <Form.Item label={t("quickMessages.name")} required>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={QuickMessagesEnum.MAX_NAME_LENGTH}
            placeholder={t("quickMessages.namePlaceholder")}
          />
        </Form.Item>

        <Form.Item
          label={t("quickMessages.blocks")}
          extra={t("quickMessages.blocksHelp")}
        >
          <Space direction="vertical" className="w-full">
            {blocks.map((block: IEditorBlock, index: number) => (
              <QuickMessageBlockEditor
                key={block.uid}
                block={block}
                index={index}
                count={blocks.length}
                fields={fields}
                onChange={(next: IEditorBlock) => change(index, next)}
                onMove={(direction: -1 | 1) => move(index, direction)}
                onRemove={() => remove(index)}
              />
            ))}

            <Space>
              <Button
                icon={<FontSizeOutlined />}
                disabled={isFull}
                onClick={() => add(QuickMessagesEnum.BlockType.TEXT)}
              >
                {t("quickMessages.addText")}
              </Button>
              <Button
                icon={<PaperClipOutlined />}
                disabled={isFull}
                onClick={() => add(QuickMessagesEnum.BlockType.MEDIA)}
              >
                {t("quickMessages.addMedia")}
              </Button>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item label={t("quickMessages.whoCanUse")}>
          <Space direction="vertical" className="w-full">
            <Space>
              <Switch checked={allEmployees} onChange={setAllEmployees} />
              <span>{t("quickMessages.allEmployees")}</span>
            </Space>

            {!allEmployees && (
              <Select
                mode="multiple"
                className="w-full"
                value={employeesIds}
                onChange={setEmployeesIds}
                placeholder={t("quickMessages.pickEmployees")}
                optionFilterProp="label"
                options={employees.map((employee: IEmployee) => ({
                  value: employee._id,
                  label: employee.name,
                }))}
              />
            )}
          </Space>
        </Form.Item>

        <Button type="primary" loading={isSaving} onClick={save}>
          {t("common.save")}
        </Button>
      </Form>
    </Card>
  );
}
