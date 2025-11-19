import {
  MessageActionRow,
  ButtonStyles,
  TextInputStyles,
} from 'oceanic.js';

type ComponentType = any;

export class ComponentBuilder {
  private rows: MessageActionRow[] = [];

  public addActionRow(
    builder: (row: ActionRowBuilder) => ActionRowBuilder
  ): ComponentBuilder {
    const rowBuilder = new ActionRowBuilder();
    builder(rowBuilder);
    this.rows.push(rowBuilder.build());
    return this;
  }

  public build(): MessageActionRow[] {
    return this.rows;
  }

  public toJSON(): MessageActionRow[] {
    return this.rows;
  }
}

export class ActionRowBuilder {
  private components: ComponentType[] = [];

  public addButton(
    customID: string,
    label: string,
    style: ButtonStyles = ButtonStyles.PRIMARY,
    options?: {
      emoji?: string;
      disabled?: boolean;
      url?: string;
    }
  ): ActionRowBuilder {
    const button: any = {
      type: 2,
      customID: options?.url ? undefined : customID,
      label,
      style,
      emoji: options?.emoji ? { name: options.emoji } : undefined,
      disabled: options?.disabled ?? false,
      url: options?.url,
    };

    this.components.push(button);
    return this;
  }

  public addLinkButton(label: string, url: string, emoji?: string): ActionRowBuilder {
    return this.addButton('', label, ButtonStyles.LINK, { url, emoji });
  }

  public addSelectMenu(
    customID: string,
    options: Array<{
      label: string;
      value: string;
      description?: string;
      emoji?: string;
      default?: boolean;
    }>,
    config?: {
      placeholder?: string;
      minValues?: number;
      maxValues?: number;
      disabled?: boolean;
    }
  ): ActionRowBuilder {
    const selectMenu: any = {
      type: 3,
      customID,
      options: options.map((opt) => ({
        label: opt.label,
        value: opt.value,
        description: opt.description,
        emoji: opt.emoji ? { name: opt.emoji } : undefined,
        default: opt.default ?? false,
      })),
      placeholder: config?.placeholder,
      minValues: config?.minValues ?? 1,
      maxValues: config?.maxValues ?? 1,
      disabled: config?.disabled ?? false,
    };

    this.components.push(selectMenu);
    return this;
  }

  public build(): MessageActionRow {
    return {
      type: 1,
      components: this.components,
    } as any;
  }
}

export class ModalBuilder {
  private modal: {
    customID: string;
    title: string;
    components: MessageActionRow[];
  };

  constructor(customID: string, title: string) {
    this.modal = {
      customID,
      title,
      components: [],
    };
  }

  public addTextInput(
    customID: string,
    label: string,
    style: TextInputStyles = TextInputStyles.SHORT,
    options?: {
      placeholder?: string;
      value?: string;
      required?: boolean;
      minLength?: number;
      maxLength?: number;
    }
  ): ModalBuilder {
    const textInput: any = {
      type: 4,
      customID,
      label,
      style,
      placeholder: options?.placeholder,
      value: options?.value,
      required: options?.required ?? true,
      minLength: options?.minLength,
      maxLength: options?.maxLength,
    };

    this.modal.components.push({
      type: 1,
      components: [textInput],
    } as any);

    return this;
  }

  public build() {
    return this.modal;
  }

  public toJSON() {
    return this.modal;
  }
}
