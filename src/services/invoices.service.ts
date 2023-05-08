import { Injectable } from "@nestjs/common";
import { User } from "ffc-prisma-package/dist/client";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { S3 } from "aws-sdk";

@Injectable()
export class InvoicesService {
  private s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  constructor() {}

  /**
   *
   * @param products Products to add to the invoice
   * @param user Prisma user object of the user
   * @param invoice_uuid UUID of the invoice
   * @param showTotalPrice Show the total price of the invoice on the PDF file
   * @returns Returns a buffer of the PDF invoice
   */
  async generatePDFInvoice(
    products: { name: string; price: number }[],
    user: User,
    invoice_uuid: string,
    showTotalPrice: boolean = true
  ): Promise<Buffer> {
    const totalProductsPrice = products.reduce((acc, product) => {
      return acc + product.price;
    }, 0);

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const docDefinition = {
      // Ajouter votre nom de marque ici
      header: {
        text: "Fur Fight Club",
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 10],
      },
      content: [
        { text: "Facture", style: "header" },
        { text: "Détails de la facture", style: "subheader" },
        { text: `ID de la facture : ${invoice_uuid}`, margin: [0, 10, 0, 20] },
        {
          text: `Date : ${new Date().toLocaleDateString("FR-fr")}`,
          margin: [0, 10, 0, 0],
        },
        {
          text: `Nom : ${user.firstname} ${user.lastname}`,
          margin: [0, 10, 0, 0],
        },
        { text: `Email : ${user.email}`, margin: [0, 10, 0, 0] },
        { text: "", margin: [0, 10, 0, 0] },
        { text: "", margin: [0, 10, 0, 0] },
        { text: "Détails des produits", style: "subheader" },
        products.map((product) => ({
          text: `- ${product.name} : ${product.price}€`,
          margin: [0, 10, 0, 0],
        })),
        showTotalPrice
          ? { text: `Total : ${totalProductsPrice}€`, margin: [0, 50, 0, 0] }
          : null,
      ],
    };

    const pdf = pdfMake.createPdf(docDefinition);
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      pdf.getBuffer((buffer) => {
        resolve(buffer);
      });
    });

    return buffer;
  }

  /**
   *
   * @param buffer PDF file buffer
   * @param file_name Name of the file
   * @returns The URL and the name of the file uploaded on the S3 Bucket
   */
  async uploadPDFInvoice(
    buffer: Buffer,
    file_name: string
  ): Promise<{ url: string; name: string }> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file_name,
      Body: buffer,
    };

    await this.s3.upload(params).promise();
    return {
      url: `https://s3-${this.s3.config.region}.amazonaws.com/${params.Bucket}/${params.Key}`,
      name: file_name,
    };
  }
}
