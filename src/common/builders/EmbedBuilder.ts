import { Embed, EmbedField, EmbedAuthor, EmbedFooter, EmbedImage } from 'oceanic.js';

export class EmbedBuilder {
  private embed: Partial<Embed>;

  constructor() {
    this.embed = {};
  }

  public setTitle(title: string): this {
    this.embed.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.embed.description = description;
    return this;
  }

  public setColor(color: number | string): this {
    if (typeof color === 'string') {
      this.embed.color = parseInt(color.replace('#', ''), 16);
    } else {
      this.embed.color = color;
    }
    return this;
  }

  public setURL(url: string): this {
    this.embed.url = url;
    return this;
  }

  public setTimestamp(timestamp?: Date | number): this {
    if (timestamp instanceof Date) {
      this.embed.timestamp = timestamp.toISOString();
    } else if (typeof timestamp === 'number') {
      this.embed.timestamp = new Date(timestamp).toISOString();
    } else {
      this.embed.timestamp = new Date().toISOString();
    }
    return this;
  }

  public setThumbnail(url: string): this {
    this.embed.thumbnail = { url };
    return this;
  }

  public setImage(url: string): this {
    this.embed.image = { url };
    return this;
  }

  public setAuthor(name: string, iconURL?: string, url?: string): this {
    this.embed.author = {
      name,
      iconURL,
      url,
    };
    return this;
  }

  public setFooter(text: string, iconURL?: string): this {
    this.embed.footer = {
      text,
      iconURL,
    };
    return this;
  }

  public addField(name: string, value: string, inline: boolean = false): this {
    if (!this.embed.fields) {
      this.embed.fields = [];
    }
    this.embed.fields.push({ name, value, inline });
    return this;
  }

  public addFields(...fields: Array<{ name: string; value: string; inline?: boolean }>): this {
    if (!this.embed.fields) {
      this.embed.fields = [];
    }
    this.embed.fields.push(...fields.map((f) => ({ ...f, inline: f.inline ?? false })));
    return this;
  }

  public setFields(...fields: Array<{ name: string; value: string; inline?: boolean }>): this {
    this.embed.fields = fields.map((f) => ({ ...f, inline: f.inline ?? false }));
    return this;
  }

  public build(): Embed {
    return this.embed as Embed;
  }

  public toJSON(): Partial<Embed> {
    return { ...this.embed };
  }

  public static success(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`✅ ${title}`)
      .setDescription(description || '');
  }

  public static error(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle(`❌ ${title}`)
      .setDescription(description || '');
  }

  public static warning(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`⚠️ ${title}`)
      .setDescription(description || '');
  }

  public static info(title: string, description?: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`ℹ️ ${title}`)
      .setDescription(description || '');
  }
}
