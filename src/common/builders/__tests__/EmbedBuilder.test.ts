import { EmbedBuilder } from '../EmbedBuilder';

describe('EmbedBuilder', () => {
  describe('Basic embed creation', () => {
    it('should create an empty embed', () => {
      const embed = new EmbedBuilder().build();
      expect(embed).toBeDefined();
    });

    it('should set title', () => {
      const embed = new EmbedBuilder().setTitle('Test Title').build();
      expect(embed.title).toBe('Test Title');
    });

    it('should set description', () => {
      const embed = new EmbedBuilder().setDescription('Test Description').build();
      expect(embed.description).toBe('Test Description');
    });

    it('should set color from hex string', () => {
      const embed = new EmbedBuilder().setColor('#FF0000').build();
      expect(embed.color).toBe(0xff0000);
    });

    it('should set color from number', () => {
      const embed = new EmbedBuilder().setColor(0xff0000).build();
      expect(embed.color).toBe(0xff0000);
    });
  });

  describe('Fields', () => {
    it('should add a single field', () => {
      const embed = new EmbedBuilder().addField('Field Name', 'Field Value').build();
      expect(embed.fields).toHaveLength(1);
      expect(embed.fields?.[0]).toEqual({
        name: 'Field Name',
        value: 'Field Value',
        inline: false,
      });
    });

    it('should add an inline field', () => {
      const embed = new EmbedBuilder().addField('Field Name', 'Field Value', true).build();
      expect(embed.fields?.[0].inline).toBe(true);
    });

    it('should add multiple fields', () => {
      const embed = new EmbedBuilder()
        .addFields(
          { name: 'Field 1', value: 'Value 1' },
          { name: 'Field 2', value: 'Value 2', inline: true }
        )
        .build();
      expect(embed.fields).toHaveLength(2);
    });
  });

  describe('Author and Footer', () => {
    it('should set author', () => {
      const embed = new EmbedBuilder().setAuthor('Author Name', 'icon_url', 'url').build();
      expect(embed.author).toEqual({
        name: 'Author Name',
        iconURL: 'icon_url',
        url: 'url',
      });
    });

    it('should set footer', () => {
      const embed = new EmbedBuilder().setFooter('Footer Text', 'icon_url').build();
      expect(embed.footer).toEqual({
        text: 'Footer Text',
        iconURL: 'icon_url',
      });
    });
  });

  describe('Static helpers', () => {
    it('should create success embed', () => {
      const embed = EmbedBuilder.success('Success', 'Description').build();
      expect(embed.title).toBe('✅ Success');
      expect(embed.color).toBe(0x00ff00);
    });

    it('should create error embed', () => {
      const embed = EmbedBuilder.error('Error', 'Description').build();
      expect(embed.title).toBe('❌ Error');
      expect(embed.color).toBe(0xff0000);
    });

    it('should create warning embed', () => {
      const embed = EmbedBuilder.warning('Warning', 'Description').build();
      expect(embed.title).toBe('⚠️ Warning');
      expect(embed.color).toBe(0xffa500);
    });

    it('should create info embed', () => {
      const embed = EmbedBuilder.info('Info', 'Description').build();
      expect(embed.title).toBe('ℹ️ Info');
      expect(embed.color).toBe(0x0099ff);
    });
  });

  describe('Timestamp', () => {
    it('should set current timestamp', () => {
      const before = new Date().toISOString();
      const embed = new EmbedBuilder().setTimestamp().build();
      const after = new Date().toISOString();

      expect(embed.timestamp).toBeDefined();
      expect(embed.timestamp! >= before).toBe(true);
      expect(embed.timestamp! <= after).toBe(true);
    });

    it('should set specific timestamp from Date', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const embed = new EmbedBuilder().setTimestamp(date).build();
      expect(embed.timestamp).toBe(date.toISOString());
    });
  });
});
