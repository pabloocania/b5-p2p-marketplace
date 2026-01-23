import { useState } from "react";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import TelegramSupportButton from "@/components/kioscoin/support/TelegramSupportButton";
import { useKioscoinUserContext } from "@/components/kioscoin/users/KioscoinUserContext";

type Language = "es" | "en";

export default function FAQsPage() {
  const [language, setLanguage] = useState<Language>("es");
  const router = useRouter();
  const { user } = useKioscoinUserContext();
  const supportUserId = user?.id ?? "guest";

  const content = {
    es: {
      title: "Preguntas Frecuentes",
      intro:
        "Aquí encontrarás respuestas a las preguntas más comunes sobre Kioscoin.",
      sections: [
        {
          q: "¿Cómo funciona Kioscoin?",
          a: "Las operaciones a través de Kioscoin se basan en contratos inteligentes de custodia de fondos, que garantizan el intercambio de stablecoins (denominadas también “dólar cripto” USDT y USDC) de manera segura, descentralizada y abierta. Este tipo de contrato de sistema se denomina “Escrow”.",
        },
        {
          q: "¿Qué es un sistema escrow?",
          a: "El escrow (depósito en garantía) es un protocolo de intercambio donde un tercero imparcial (un contrato inteligente en una blockchain descentralizada) retiene fondos hasta que se cumplan las condiciones pactadas entre vendedor y comprador.",
        },
        {
          q: "¿Cómo funciona un sistema de escrow?",
          a: "Una vez que vendedor y comprador pactan un intercambio de stablecoin a cambio de moneda local, el vendedor deposita el dólar digital en un contrato inteligente descentralizado. El comprador procederá a enviar el importe de moneda local (e.j. pesos argentinos) a través del medio pactado entre las partes (e.j. transferencia bancaria). Cuando el vendedor haya recibido dicha transferencia, procederá a liberar los fondos depositados en el contrato inteligente.",
        },
        {
          q: "¿Qué sucede si una de las partes no cumple con sus obligaciones?",
          a: "Solo en el caso de que se demuestre que alguna de las partes actúa de mala fe, un mediador procederá a intervenir en el proceso y resolver cualquier tipo de conflicto. Para esto, la parte afectada deberá crear una disputa. Un administrador procederá a analizar la evidencia y resolver la disputa. Los administradores de la plataforma no pueden intervenir en ningún caso donde no se haya creado una disputa. Al ser un sistema descentralizado y en la blockchain, es trustless y seguro.",
        },
        {
          q: "¿Qué métodos de pago están disponibles?",
          a: "Transferencia bancaria a través de CBU, alias o IBAN para transferencias SEPA, billeteras virtuales.",
        },
        {
          q: "¿Cuáles son los límites de venta y qué comisión cobra Kioscoin?",
          a: "Hasta la fecha 14/03/2026 los rangos operables son de 20 USDT/USDC a 1000 USDT/USDC.\n\nPosteriormente, las comisiones se regirán por el siguiente esquema:\n\nLas comisiones varían según el volumen de la transacción:\n1-50 USDT: 0.5 fijo\n50-100 USDT: 1.25%\n100-1,000 USDT: 1%\n1,000-5,000 USDT: 0.75%\n5,000-10,000 USDT: 0.5%\n+10,000 USDT: 0.25%",
        },
        {
          q: "¿En qué redes puedo operar?",
          a: "Actualmente soportamos BSC (Binance Smart Chain), Arbitrum y Base. Cada anuncio especifica en qué red se realizará la transacción.",
        },
        {
          q: "¿Cómo me protejo de fraudes?",
          a: "Siempre verifica la reputación del trader (número de trades y porcentaje de completados), nunca liberes fondos hasta confirmar el pago, y comunícate solo a través de la plataforma.",
        },
        {
          q: "¿Puedo crear mis propios anuncios?",
          a: "Sí, una vez que conectes tu wallet y completes la verificación básica, podrás crear anuncios de compra o venta con tus propios términos y precios.",
        },
        {
          q: "¿Qué hago si hay una disputa?",
          a: "En caso de disputa, puedes abrir un ticket de soporte. Nuestro equipo revisará las pruebas de ambas partes y tomará una decisión justa basada en la evidencia presentada.\n\nLas órdenes tienen un tiempo de tolerancia hasta que se consideran disputas.\n\nEl tiempo de tolerancia para disputas es de 5 minutos.",
          showSupportButton: true,
        },
        {
          q: "¿La app móvil se puede descargar?",
          a: "Sí. Kioscoin se puede descargar desde el navegador de Chrome y alojarse en tu móvil. En este video te explicamos cómo hacerlo:",
        },
        {
          q: "¿Tienes alguna duda adicional?",
          a: "Nuestro equipo de soporte está disponible 24/7 para ayudarte.\n\nCada vez somos más los amigos de Kioscoin, únete a nuestra comunidad:\nNuestra comunidad\n\nEquipo Kioscoin",
        },
      ],
    },
    en: {
      title: "Frequently Asked Questions",
      intro:
        "Here you will find answers to the most common questions about Kioscoin.",
      sections: [
        {
          q: "How does Kioscoin work?",
          a: "Transactions on Kioscoin are based on smart-contract fund custody, which guarantees the exchange of stablecoins (also called “crypto dollars” USDT and USDC) in a secure, decentralized, and open way. This type of system contract is called “Escrow.”",
        },
        {
          q: "What is an escrow system?",
          a: "Escrow is an exchange protocol where an impartial third party (a smart contract on a decentralized blockchain) holds funds until the conditions agreed by buyer and seller are met.",
        },
        {
          q: "How does an escrow system work?",
          a: "Once seller and buyer agree on a stablecoin exchange for local currency, the seller deposits the digital dollars into a decentralized smart contract. The buyer sends the local currency amount (e.g., Argentine pesos) through the agreed method (e.g., bank transfer). When the seller confirms receipt, they release the funds from the smart contract.",
        },
        {
          q: "What happens if one party does not meet their obligations?",
          a: "Only if bad faith is proven will a mediator intervene and resolve the conflict. The affected party must open a dispute. An administrator reviews the evidence and resolves the dispute. Platform admins cannot intervene in any case where no dispute has been opened. As it runs on-chain, the system is trustless and secure.",
        },
        {
          q: "What payment methods are available?",
          a: "Bank transfer via CBU, alias or IBAN for SEPA transfers, and virtual wallets.",
        },
        {
          q: "What are the selling limits and fees?",
          a: "As of 03/14/2026, the operable range is 20 USDT/USDC to 1,000 USDT/USDC.\n\nAfter that, fees follow this schedule:\n\nFees vary based on transaction volume:\n1-50 USDT: 0.5 fixed\n50-100 USDT: 1.25%\n100-1,000 USDT: 1%\n1,000-5,000 USDT: 0.75%\n5,000-10,000 USDT: 0.5%\n+10,000 USDT: 0.25%",
        },
        {
          q: "Which networks can I use?",
          a: "We currently support BSC (Binance Smart Chain), Arbitrum, and Base. Each listing specifies which network will be used.",
        },
        {
          q: "How do I protect myself from fraud?",
          a: "Always verify the trader’s reputation (number of trades and completion rate), never release funds until you confirm payment, and communicate only through the platform.",
        },
        {
          q: "Can I create my own listings?",
          a: "Yes. Once you connect your wallet and complete basic verification, you can create buy or sell listings with your own terms and prices.",
        },
        {
          q: "What do I do if there is a dispute?",
          a: "If there’s a dispute, you can open a support ticket. Our team will review evidence from both sides and make a fair decision.\n\nOrders have a tolerance time before they are considered disputes.\n\nThe tolerance time for disputes is 5 minutes.",
          showSupportButton: true,
        },
        {
          q: "Can I download the mobile app?",
          a: "Yes. Kioscoin can be installed from the Chrome browser and added to your phone. In this video we explain how:",
        },
        {
          q: "Do you have any additional questions?",
          a: "Our support team is available 24/7 to help you.\n\nWe are more and more friends of Kioscoin. Join our community:\nOur community\n\nKioscoin Team",
        },
      ],
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-secondary/10 px-4 py-10 sm:px-8 font-secondary">
      <div className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-secondary/20 bg-white p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              {t.title}
            </h1>
            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="text-xs border border-primary/40 rounded-md px-2.5 py-1.5 text-primary hover:bg-primary/10"
            >
              {language === "es" ? "ENG" : "ESP"}
            </button>
          </div>
          <button
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full border border-primary/30 text-primary hover:bg-primary/10 flex items-center justify-center"
            aria-label={language === "es" ? "Cerrar" : "Close"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-dark">{t.intro}</p>

        <div className="space-y-6">
          {t.sections.map((item, idx) => (
            <section key={idx} className="space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-primary">
                {item.q}
              </h2>
              <p className="text-sm text-dark whitespace-pre-line">
                {item.a.includes("Equipo Kioscoin") ||
                item.a.includes("Kioscoin Team") ? (
                  <>
                    {item.a
                      .split(/(Equipo Kioscoin|Kioscoin Team)/g)
                      .map((part, idx) =>
                        part === "Equipo Kioscoin" ||
                        part === "Kioscoin Team" ? (
                          <span
                            key={`${idx}-${part}`}
                            className="font-bold text-[#3e2262]"
                          >
                            {part}
                          </span>
                        ) : (
                          <span key={`${idx}-${part}`}>{part}</span>
                        )
                      )}
                  </>
                ) : (
                  item.a
                )}
              </p>
              {item.showSupportButton && (
                <div className="pt-2">
                  <TelegramSupportButton
                    userId={supportUserId}
                    className="sm:w-auto"
                  />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
