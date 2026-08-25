"use client";

import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { BUSINESS_INFO, formatMoney, itemsTotal, itemSubtotal, todayDDMMYYYY, type ClientInfo, type DocumentItem } from "@/lib/documents";

// Calcado del remito real que pasó Fernando (Remito LaserKind.pdf): banda
// verde arriba, caja de datos de la empresa + caja Nº/Fecha, datos del
// cliente, tabla de artículos, "RECIBI CONFORME" con firma y sello.
const TEAL = "#1BAE93";
const BORDER = "#cfcfcf";
const TEXT = "#222222";
const MUTED = "#555555";

const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 30, paddingHorizontal: 30, fontSize: 9, fontFamily: "Helvetica", color: TEXT },
  topBand: { height: 16, backgroundColor: TEAL, marginBottom: 20 },
  headerRow: { flexDirection: "row", gap: 12, marginBottom: 16, paddingHorizontal: 30 },
  companyBox: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  logo: { width: 46, height: 46, objectFit: "contain" },
  companyInfo: { flexDirection: "column", gap: 1.5 },
  row: { flexDirection: "row", gap: 4 },
  label: { fontFamily: "Helvetica-Bold", width: 55 },
  docBox: { width: 150, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 10, justifyContent: "center", gap: 4 },
  docTitle: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  clientBlock: { paddingHorizontal: 30, marginBottom: 14, gap: 2 },
  clientRow: { flexDirection: "row" },
  clientCol: { flex: 1, flexDirection: "column", gap: 2 },
  table: { marginHorizontal: 30, borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" },
  tHeadRow: { flexDirection: "row", backgroundColor: TEAL },
  tHeadCell: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9, padding: 6 },
  tRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER },
  tCell: { padding: 6, fontStyle: "italic", fontSize: 9 },
  colArt: { width: "10%", textAlign: "center" },
  colDesc: { flex: 1 },
  colQty: { width: "14%", textAlign: "right" },
  colPrice: { width: "16%", textAlign: "right" },
  colSubtotal: { width: "18%", textAlign: "right" },
  totalRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: "#f4f4f4" },
  totalLabel: { flex: 1, padding: 6, fontFamily: "Helvetica-Bold", textAlign: "right" },
  totalValue: { width: "18%", padding: 6, fontFamily: "Helvetica-Bold", textAlign: "right" },
  signBox: {
    marginTop: 28,
    marginHorizontal: 30,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 12,
    minHeight: 90,
  },
  signLabel: { fontFamily: "Helvetica-Bold", marginBottom: 40 },
  signLine: { borderTopWidth: 1, borderTopColor: TEXT, width: 220, alignSelf: "center", paddingTop: 4 },
  signCaption: { textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 8 },
  disclaimer: { marginTop: 28, marginHorizontal: 30, fontSize: 8, color: MUTED, textAlign: "center" },
});

function CompanyHeader({ docTitle, number, date }: { docTitle: string; number: string; date: string }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.companyBox}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image no usa alt */}
        <Image src="/images/logo-empresa.jpg" style={styles.logo} />
        <View style={styles.companyInfo}>
          <View style={styles.row}>
            <Text style={styles.label}>Razón Social</Text>
            <Text>{BUSINESS_INFO.razonSocial}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CUIT</Text>
            <Text>{BUSINESS_INFO.cuit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección</Text>
            <Text>{BUSINESS_INFO.direccion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Localidad</Text>
            <Text>{BUSINESS_INFO.localidad}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono</Text>
            <Text>{BUSINESS_INFO.telefono}</Text>
          </View>
        </View>
      </View>
      <View style={styles.docBox}>
        <Text style={styles.docTitle}>{docTitle}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nº</Text>
          <Text>{number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha</Text>
          <Text>{date}</Text>
        </View>
      </View>
    </View>
  );
}

function ClientBlock({ client }: { client: ClientInfo }) {
  return (
    <View style={styles.clientBlock}>
      <View style={styles.clientRow}>
        <View style={styles.clientCol}>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text>{client.nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Domicilio</Text>
            <Text>{client.domicilio}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Localidad</Text>
            <Text>{client.localidad}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CUIT</Text>
            <Text>{client.cuit}</Text>
          </View>
        </View>
        <View style={styles.clientCol}>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono</Text>
            <Text>{client.telefono}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>C.P.</Text>
            <Text>{client.cp}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Provincia</Text>
            <Text>{client.provincia}</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Otros Datos</Text>
        <Text>{client.otrosDatos}</Text>
      </View>
    </View>
  );
}

export function RemitoDocument({ client, items, number }: { client: ClientInfo; items: DocumentItem[]; number: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBand} />
        <CompanyHeader docTitle="REMITO" number={number} date={todayDDMMYYYY()} />
        <ClientBlock client={client} />

        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={[styles.tHeadCell, styles.colArt]}>Artículo</Text>
            <Text style={[styles.tHeadCell, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.tHeadCell, styles.colQty]}>Cantidad</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tRow}>
              <Text style={[styles.tCell, styles.colArt]}>{i + 1}</Text>
              <Text style={[styles.tCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tCell, styles.colQty]}>{item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signBox}>
          <Text style={styles.signLabel}>RECIBI CONFORME:</Text>
          <View style={styles.signLine}>
            <Text style={styles.signCaption}>FIRMA Y SELLO</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function PresupuestoDocument({ client, items, number }: { client: ClientInfo; items: DocumentItem[]; number: string }) {
  const total = itemsTotal(items);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBand} />
        <CompanyHeader docTitle="PRESUPUESTO" number={number} date={todayDDMMYYYY()} />
        <ClientBlock client={client} />

        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={[styles.tHeadCell, styles.colArt]}>Artículo</Text>
            <Text style={[styles.tHeadCell, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.tHeadCell, styles.colQty]}>Cantidad</Text>
            <Text style={[styles.tHeadCell, styles.colPrice]}>Precio Unit.</Text>
            <Text style={[styles.tHeadCell, styles.colSubtotal]}>Subtotal</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tRow}>
              <Text style={[styles.tCell, styles.colArt]}>{i + 1}</Text>
              <Text style={[styles.tCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tCell, styles.colPrice]}>{formatMoney(item.unitPrice)}</Text>
              <Text style={[styles.tCell, styles.colSubtotal]}>{formatMoney(itemSubtotal(item))}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Presupuesto sin validez de factura. Precios sujetos a modificación sin previo aviso.
        </Text>
      </Page>
    </Document>
  );
}
