declare module "mjml" {
  interface MJMLParseResults {
    html: string;
    errors: string[];
  }

  export default function mjml(template: string): MJMLParseResults;
}
