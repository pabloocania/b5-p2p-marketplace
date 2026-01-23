import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { FileText, Shield } from "lucide-react";

interface TermsCondPrivacyPolicyProps {
  onComplete: () => void;
  onClose?: () => void; // Called when user closes modal (X button)
  readOnly?: boolean; // If true, hide checkbox and accept button (for viewing from profile)
}

type Language = "en" | "es";

export default function TermsCondPrivacyPolicy({
  onComplete,
  onClose,
  readOnly = false,
}: TermsCondPrivacyPolicyProps) {
  const [language, setLanguage] = useState<Language>("es");
  const [hasRead, setHasRead] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state when component mounts
  useEffect(() => {
    setIsOpen(true);
    setHasRead(false);
    setIsAtBottom(false);
    // Reset scroll position after a brief delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - reset only on mount

  // Terms and Conditions - English
  const termsAndConditionsTextEN = `KIOSCOIN – TERMS OF SERVICE
Last updated: December 23, 2025

Important Notice (Pilot / Limited Release)
Kioscoin may be offered as a limited-access pilot, beta, or closed test. Features may change, be interrupted, restricted, or discontinued at any time. By using the Platform, you acknowledge and accept that the Platform may not operate error-free or continuously during this phase.

These Terms of Service (the "Terms") govern your access to and use of the Kioscoin application, website, and related services (collectively, the "Platform").
By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, do not use the Platform.

1. PLATFORM OVERVIEW
Kioscoin is a technological tool designed to facilitate peer-to-peer (P2P) interactions between users who wish to exchange digital assets (including crypto-assets) and/or fiat currency with other users.

Kioscoin acts solely as a software provider. Kioscoin does not act as a buyer, seller, broker, agent, financial intermediary, or counterparty in any transaction between users.

2. NON-CUSTODIAL NATURE – NO HOLDING OF USER FUNDS
Kioscoin does not hold, custody, control, safeguard, or manage user funds or crypto-assets. Kioscoin does not take possession of users' private keys.
Any transaction, transfer, payment, or exchange is executed at the user's sole discretion and risk.

3. LEGAL JURISDICTION AND INTENDED SCOPE
Kioscoin is developed and maintained by an entity established in the Republic of Argentina. The Platform operates under the laws of Argentina and is not intended to be directed to jurisdictions where its availability or use would be unlawful.

4. ACCEPTANCE AND CHANGES DURING USE
By creating an account, accessing, or using the Platform, you confirm that you have read, understood, and accepted these Terms. Continued use of the Platform constitutes acceptance of any updated Terms published under Section 18.

5. NO FINANCIAL ADVICE – NO REGULATED FINANCIAL SERVICES
Kioscoin does not provide investment, legal, tax, or financial advice. Any information displayed on the Platform is for general informational purposes only.

Kioscoin is not a bank, broker, exchange, payment service provider, money transmitter, or financial institution. Kioscoin does not provide brokerage, custody, exchange, or payment services as a financial intermediary.

6. USER RESPONSIBILITY AND COMPLIANCE
You are solely responsible for ensuring that your use of the Platform complies with all applicable laws and regulations in your jurisdiction, including but not limited to tax obligations, reporting duties, and anti-money laundering / counter-terrorist financing requirements, where applicable.

You should seek independent professional advice before engaging in any P2P transaction.

7. P2P TRANSACTIONS – USER-TO-USER RESPONSIBILITY
All P2P transactions are conducted solely between users. Kioscoin is not a party to any transaction and does not mediate or guarantee the performance of any user.

Users are solely responsible for:
a) verifying the counterparty and transaction details (including bank details and wallet addresses);
b) ensuring payments and transfers are made accurately;
c) understanding that certain transactions may be irreversible;
d) complying with any legal, tax, or regulatory requirements associated with their activity.

8. PROHIBITED USE AND RESTRICTIONS
You agree not to use the Platform for any unlawful activity, including but not limited to:
a) money laundering, terrorist financing, or proliferation financing;
b) fraud, scams, deception, or impersonation;
c) market manipulation or abusive practices;
d) circumvention of sanctions, embargoes, or legal restrictions;
e) violation of any applicable securities, financial, or consumer protection regulations;
f) attempts to disrupt, damage, reverse engineer, or compromise the security of the Platform.

Kioscoin reserves the right to restrict, suspend, or terminate access (in whole or in part) when there are reasonable grounds to suspect prohibited or unlawful activity, security risk, or breach of these Terms.

9. ACCOUNT SECURITY
You are responsible for maintaining the confidentiality and security of your account credentials and device access. You agree to promptly notify Kioscoin through official support channels if you suspect unauthorized access or misuse.

10. RISK ACKNOWLEDGEMENT
You acknowledge that crypto-assets and digital asset transactions involve significant risks, including (without limitation):
a) market volatility and possible total loss of value;
b) technological risks (software bugs, outages, network congestion, protocol changes);
c) cybersecurity risks (phishing, malware, compromised accounts);
d) regulatory and tax risks (changes in laws, reporting obligations).

You confirm that you understand these risks and assume full responsibility for any outcomes.

11. NO GUARANTEE OF TRANSACTIONS OR OUTCOMES
Kioscoin does not guarantee that any P2P transaction will be completed, that any counterparty will perform, or that any price, timing, or availability will be maintained. All outcomes depend on user decisions and counterparty performance.

12. THIRD-PARTY SERVICES AND LINKS
The Platform may reference or integrate third-party services (including identity providers, analytics, wallet tools, banking rails, or other external providers). Kioscoin does not control and is not responsible for the content, accuracy, availability, security, or practices of any third-party service. Use of third-party services is at your sole risk and subject to the third party's terms.

13. PRIVACY AND DATA HANDLING
Kioscoin may collect and process limited technical, diagnostic, and usage data necessary to operate, secure, and improve the Platform, in accordance with its Privacy Policy.

Any personal information voluntarily provided by the user or requested for security/compliance purposes will be processed in accordance with applicable data protection laws and Kioscoin's Privacy Policy.

14. DISCLAIMER OF WARRANTIES
The Platform is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, whether express or implied, to the maximum extent permitted by applicable law.

Kioscoin makes no warranties regarding the availability, reliability, accuracy, security, or fitness for a particular purpose of the Platform.

15. LIMITATION OF LIABILITY
To the fullest extent permitted by applicable law, Kioscoin, its affiliates, officers, directors, employees, developers, contractors, or agents shall not be liable for any direct or indirect damages, losses, or costs arising from or related to:
a) your use of, or inability to use, the Platform;
b) any P2P transaction or dispute between users;
c) counterparty non-performance, fraud, or user error;
d) volatility or loss of value of crypto-assets;
e) loss of profits, data, goodwill, or reputation.

If liability cannot be excluded under applicable law, Kioscoin's aggregate liability shall be limited to the maximum extent permitted by law.

16. COMPLIANCE MEASURES AND INFORMATION REQUESTS
Kioscoin may, at its discretion and as permitted by law, request additional information or implement reasonable measures to mitigate fraud and compliance risks (including identity checks, account limitations, and monitoring of suspicious activity patterns). Failure to provide requested information may result in restricted access or account suspension.

17. DISPUTE RESOLUTION AND SUPPORT
Questions, complaints, or disputes related to Platform functionality should be addressed through Kioscoin's support channels. Kioscoin may make reasonable efforts to assist users, but does not guarantee any specific outcome, resolution, or reimbursement, and does not act as an arbitrator of P2P disputes.

18. MODIFICATIONS TO THESE TERMS
Kioscoin may modify these Terms at any time. The updated version will be published on the Platform and will take effect immediately upon publication. Continued use of the Platform constitutes acceptance of the modified Terms.

19. GOVERNING LAW AND VENUE
These Terms are governed by and construed in accordance with the laws of the Republic of Argentina.
Any dispute arising from or related to these Terms shall be submitted to the competent courts of the City of Buenos Aires, Argentina.

20. CROSS-BORDER ACCESS – NO OFFER OR SOLICITATION
The Platform is made available as a decentralized technological tool developed and maintained by an Argentine entity. It is not directed toward, nor intended for use by, any person or entity in any jurisdiction where the publication, availability, or use of the Platform would be contrary to applicable law.

Accessing or using the Platform from outside Argentina does not constitute a solicitation, offer, or invitation to engage in any regulated activity in the user's jurisdiction. Users who access the Platform from other locations do so on their own initiative and are solely responsible for compliance with local laws.

20.1 EUROPEAN UNION (EU/EEA) – NO ACTIVE MARKETING; USER-INITIATED ACCESS
Kioscoin is not authorized to provide regulated crypto-asset services within the EU/EEA and does not actively market or promote services in the EU/EEA.
If a user established or located in the EU/EEA accesses the Platform, the user represents that such access is on the user's own initiative and not the result of targeted solicitation or promotion by Kioscoin. Kioscoin may implement geolocation, verification, and record-keeping measures to support this approach and may restrict access where there are reasonable doubts regarding compliance.

Any materials or information shared in this context may be treated as confidential and must not be redistributed without Kioscoin's prior written consent.

21. NO ESTABLISHMENT OUTSIDE ARGENTINA
Kioscoin does not maintain subsidiaries, branches, or offices outside the Republic of Argentina. Any representation to the contrary by third parties is unauthorized and invalid.

22. NO PERSONALIZED SERVICES
Kioscoin does not provide personalized, tailored, or discretionary financial services. All Platform use and decisions are made solely by users at their own discretion and responsibility.`;

  // Terms and Conditions - Spanish
  const termsAndConditionsTextES = `KIOSCOIN – TÉRMINOS DE SERVICIO
Última actualización: 23 de diciembre de 2025

Aviso Importante (Piloto / Lanzamiento Limitado)
Kioscoin puede ofrecerse como piloto de acceso limitado, beta o prueba cerrada. Las funciones pueden cambiar, interrumpirse, restringirse o discontinuarse en cualquier momento. Al usar la Plataforma, usted reconoce y acepta que la Plataforma puede no operar sin errores o de manera continua durante esta fase.

Estos Términos de Servicio (los "Términos") rigen su acceso y uso de la aplicación Kioscoin, sitio web y servicios relacionados (en conjunto, la "Plataforma").
Al acceder o usar la Plataforma, usted acepta estar sujeto a estos Términos. Si no está de acuerdo, no use la Plataforma.

1. RESUMEN DE LA PLATAFORMA
Kioscoin es una herramienta tecnológica diseñada para facilitar interacciones peer-to-peer (P2P) entre usuarios que desean intercambiar activos digitales (incluyendo criptoactivos) y/o moneda fiduciaria con otros usuarios.

Kioscoin actúa únicamente como proveedor de software. Kioscoin no actúa como comprador, vendedor, corredor, agente, intermediario financiero o contraparte en ninguna transacción entre usuarios.

2. NATURALEZA NO CUSTODIAL – SIN TENENCIA DE FONDOS DE USUARIOS
Kioscoin no mantiene, custodia, controla, protege o gestiona fondos de usuarios o criptoactivos. Kioscoin no toma posesión de las claves privadas de los usuarios.
Cualquier transacción, transferencia, pago o intercambio se ejecuta bajo la única discreción y riesgo del usuario.

3. JURISDICCIÓN LEGAL Y ALCANCE PREVISTO
Kioscoin es desarrollado y mantenido por una entidad establecida en la República Argentina. La Plataforma opera bajo las leyes de Argentina y no está destinada a ser dirigida a jurisdicciones donde su disponibilidad o uso sería ilegal.

4. ACEPTACIÓN Y CAMBIOS DURANTE EL USO
Al crear una cuenta, acceder o usar la Plataforma, usted confirma que ha leído, entendido y aceptado estos Términos. El uso continuo de la Plataforma constituye la aceptación de cualquier Término actualizado publicado bajo la Sección 18.

5. SIN ASESORAMIENTO FINANCIERO – SIN SERVICIOS FINANCIEROS REGULADOS
Kioscoin no proporciona asesoramiento de inversión, legal, fiscal o financiero. Cualquier información mostrada en la Plataforma es solo para fines informativos generales.

Kioscoin no es un banco, corredor, exchange, proveedor de servicios de pago, transmisor de dinero o institución financiera. Kioscoin no proporciona servicios de corretaje, custodia, intercambio o pago como intermediario financiero.

6. RESPONSABILIDAD DEL USUARIO Y CUMPLIMIENTO
Usted es el único responsable de asegurar que su uso de la Plataforma cumpla con todas las leyes y regulaciones aplicables en su jurisdicción, incluyendo pero no limitado a obligaciones fiscales, deberes de reporte y requisitos de prevención de lavado de dinero / financiamiento del terrorismo, cuando corresponda.

Debe buscar asesoramiento profesional independiente antes de participar en cualquier transacción P2P.

7. TRANSACCIONES P2P – RESPONSABILIDAD USUARIO A USUARIO
Todas las transacciones P2P se realizan únicamente entre usuarios. Kioscoin no es parte de ninguna transacción y no media ni garantiza el desempeño de ningún usuario.

Los usuarios son los únicos responsables de:
a) verificar la contraparte y los detalles de la transacción (incluyendo detalles bancarios y direcciones de billetera);
b) asegurar que los pagos y transferencias se realicen con precisión;
c) entender que ciertas transacciones pueden ser irreversibles;
d) cumplir con cualquier requisito legal, fiscal o regulatorio asociado con su actividad.

8. USO PROHIBIDO Y RESTRICCIONES
Usted acepta no usar la Plataforma para ninguna actividad ilegal, incluyendo pero no limitado a:
a) lavado de dinero, financiamiento del terrorismo o financiamiento de la proliferación;
b) fraude, estafas, engaño o suplantación de identidad;
c) manipulación del mercado o prácticas abusivas;
d) evasión de sanciones, embargos o restricciones legales;
e) violación de cualquier regulación aplicable de valores, financiera o protección al consumidor;
f) intentos de interrumpir, dañar, hacer ingeniería inversa o comprometer la seguridad de la Plataforma.

Kioscoin se reserva el derecho de restringir, suspender o terminar el acceso (total o parcialmente) cuando haya motivos razonables para sospechar actividad prohibida o ilegal, riesgo de seguridad o incumplimiento de estos Términos.

9. SEGURIDAD DE LA CUENTA
Usted es responsable de mantener la confidencialidad y seguridad de las credenciales de su cuenta y el acceso al dispositivo. Usted acepta notificar prontamente a Kioscoin a través de los canales de soporte oficiales si sospecha acceso no autorizado o uso indebido.

10. RECONOCIMIENTO DE RIESGOS
Usted reconoce que los criptoactivos y las transacciones de activos digitales implican riesgos significativos, incluyendo (sin limitación):
a) volatilidad del mercado y posible pérdida total de valor;
b) riesgos tecnológicos (errores de software, interrupciones, congestión de red, cambios de protocolo);
c) riesgos de ciberseguridad (phishing, malware, cuentas comprometidas);
d) riesgos regulatorios y fiscales (cambios en las leyes, obligaciones de reporte).

Usted confirma que entiende estos riesgos y asume plena responsabilidad por cualquier resultado.

11. SIN GARANTÍA DE TRANSACCIONES O RESULTADOS
Kioscoin no garantiza que ninguna transacción P2P se complete, que ninguna contraparte cumpla, o que se mantenga cualquier precio, tiempo o disponibilidad. Todos los resultados dependen de las decisiones del usuario y el desempeño de la contraparte.

12. SERVICIOS Y ENLACES DE TERCEROS
La Plataforma puede referenciar o integrar servicios de terceros (incluyendo proveedores de identidad, análisis, herramientas de billetera, infraestructura bancaria u otros proveedores externos). Kioscoin no controla y no es responsable del contenido, precisión, disponibilidad, seguridad o prácticas de ningún servicio de terceros. El uso de servicios de terceros es bajo su único riesgo y sujeto a los términos del tercero.

13. PRIVACIDAD Y MANEJO DE DATOS
Kioscoin puede recopilar y procesar datos técnicos, de diagnóstico y de uso limitados necesarios para operar, asegurar y mejorar la Plataforma, de acuerdo con su Política de Privacidad.

Cualquier información personal proporcionada voluntariamente por el usuario o solicitada para fines de seguridad/cumplimiento será procesada de acuerdo con las leyes de protección de datos aplicables y la Política de Privacidad de Kioscoin.

14. RENUNCIA DE GARANTÍAS
La Plataforma se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD", sin garantías de ningún tipo, ya sean expresas o implícitas, en la máxima medida permitida por la ley aplicable.

Kioscoin no otorga garantías respecto a la disponibilidad, confiabilidad, precisión, seguridad o idoneidad para un propósito particular de la Plataforma.

15. LIMITACIÓN DE RESPONSABILIDAD
En la máxima medida permitida por la ley aplicable, Kioscoin, sus afiliados, funcionarios, directores, empleados, desarrolladores, contratistas o agentes no serán responsables por ningún daño, pérdida o costo directo o indirecto que surja o esté relacionado con:
a) su uso o incapacidad de usar la Plataforma;
b) cualquier transacción P2P o disputa entre usuarios;
c) incumplimiento de la contraparte, fraude o error del usuario;
d) volatilidad o pérdida de valor de criptoactivos;
e) pérdida de ganancias, datos, buena voluntad o reputación.

Si la responsabilidad no puede ser excluida bajo la ley aplicable, la responsabilidad agregada de Kioscoin estará limitada a la máxima medida permitida por la ley.

16. MEDIDAS DE CUMPLIMIENTO Y SOLICITUDES DE INFORMACIÓN
Kioscoin puede, a su discreción y según lo permitido por la ley, solicitar información adicional o implementar medidas razonables para mitigar riesgos de fraude y cumplimiento (incluyendo verificaciones de identidad, limitaciones de cuenta y monitoreo de patrones de actividad sospechosa). La falta de proporcionar la información solicitada puede resultar en acceso restringido o suspensión de cuenta.

17. RESOLUCIÓN DE DISPUTAS Y SOPORTE
Las preguntas, quejas o disputas relacionadas con la funcionalidad de la Plataforma deben dirigirse a través de los canales de soporte de Kioscoin. Kioscoin puede hacer esfuerzos razonables para asistir a los usuarios, pero no garantiza ningún resultado, resolución o reembolso específico, y no actúa como árbitro de disputas P2P.

18. MODIFICACIONES A ESTOS TÉRMINOS
Kioscoin puede modificar estos Términos en cualquier momento. La versión actualizada se publicará en la Plataforma y entrará en vigor inmediatamente después de su publicación. El uso continuo de la Plataforma constituye la aceptación de los Términos modificados.

19. LEY APLICABLE Y JURISDICCIÓN
Estos Términos se rigen e interpretan de acuerdo con las leyes de la República Argentina.
Cualquier disputa que surja de o esté relacionada con estos Términos será sometida a los tribunales competentes de la Ciudad de Buenos Aires, Argentina.

20. ACCESO TRANSFRONTERIZO – SIN OFERTA O SOLICITUD
La Plataforma se pone a disposición como una herramienta tecnológica descentralizada desarrollada y mantenida por una entidad argentina. No está dirigida ni destinada para uso por ninguna persona o entidad en ninguna jurisdicción donde la publicación, disponibilidad o uso de la Plataforma sería contrario a la ley aplicable.

Acceder o usar la Plataforma desde fuera de Argentina no constituye una solicitud, oferta o invitación para participar en ninguna actividad regulada en la jurisdicción del usuario. Los usuarios que accedan a la Plataforma desde otras ubicaciones lo hacen por su propia iniciativa y son los únicos responsables del cumplimiento de las leyes locales.

20.1 UNIÓN EUROPEA (UE/EEE) – SIN MARKETING ACTIVO; ACCESO INICIADO POR EL USUARIO
Kioscoin no está autorizado para proporcionar servicios regulados de criptoactivos dentro de la UE/EEE y no comercializa ni promueve activamente servicios en la UE/EEE.
Si un usuario establecido o ubicado en la UE/EEE accede a la Plataforma, el usuario representa que dicho acceso es por iniciativa propia del usuario y no el resultado de solicitud o promoción dirigida por Kioscoin. Kioscoin puede implementar medidas de geolocalización, verificación y mantenimiento de registros para respaldar este enfoque y puede restringir el acceso donde haya dudas razonables respecto al cumplimiento.

Cualquier material o información compartida en este contexto puede tratarse como confidencial y no debe redistribuirse sin el consentimiento previo por escrito de Kioscoin.

21. SIN ESTABLECIMIENTO FUERA DE ARGENTINA
Kioscoin no mantiene subsidiarias, sucursales u oficinas fuera de la República Argentina. Cualquier representación en contrario por terceros no está autorizada y es inválida.

22. SIN SERVICIOS PERSONALIZADOS
Kioscoin no proporciona servicios financieros personalizados, adaptados o discrecionales. Todo el uso de la Plataforma y las decisiones las toman únicamente los usuarios bajo su propia discreción y responsabilidad.`;

  // Privacy Policy - English
  const privacyPolicyTextEN = `PRIVACY POLICY AND PERSONAL DATA PROTECTION
Last updated: October 2025

1. INTRODUCCIÓN
This Privacy Policy (the "Policy") describes how BEEFIVE S.A.S. ("Kioscoin", "we", "our" or "the Platform") collects, uses, stores, shares and protects the personal information of individuals ("Users") who access, use or interact with our websites, applications, services and digital products (collectively, the "Services").

Kioscoin operates under the Kioscoin brand, available through the kioscoin.com domain, including its websites, applications and related platforms.

Kioscoin recognizes the importance of protecting Users' personal data and is committed to treating it with confidentiality, security and in accordance with Law No. 25.326 on Personal Data Protection and its complementary regulations.

Access to or use of the Services implies express acceptance of this Policy.

2. DATA CONTROLLER
The controller of personal data processing is BEEFIVE S.A.S., with address at Ciudad de Mendoza, Argentina.

3. SCOPE AND APPLICATION
This Policy applies to all personal data collected by Kioscoin through:

its websites and digital platforms (kioscoin.com);
its mobile applications;
contact or registration forms; and
any other channel through which Users interact with the Platform.
It does not apply to websites, services or third-party platforms that the User may access through links from Kioscoin. In such cases, the privacy policies of such third parties will apply.

4. PERSONAL DATA WE COLLECT
Kioscoin only collects and processes the following personal data:

a) Email address: Kioscoin collects the email address provided by the User during registration and requests verification of the same. This is the only personal identification data collected by Kioscoin.

b) Navigation and usage data: information about the device, IP address, browser type, operating system, access logs, connection date and time, cookies, approximate location and usage or interaction patterns with the Platform.

IMPORTANT CLARIFICATION REGARDING KIOSCOIN'S SERVICES
Kioscoin does not provide financial services nor does it custody digital assets. Kioscoin solely provides technological infrastructure that allows users to operate at their own risk through a publicly audited and verified smart contract on the blockchain. Kioscoin acts exclusively as a software provider and does not act as a financial intermediary, custodian, or counterparty in any transaction.

Kioscoin does not request or process sensitive data, except in cases where it is strictly necessary for compliance with legal or contractual obligations.

5. PURPOSES OF PROCESSING
Personal data is processed for the following purposes:

allow the creation, administration and maintenance of User accounts;
provide, operate and improve the Services offered by Kioscoin;
process transactions, payments and operations within the Platform;
comply with legal, regulatory or contractual obligations;
prevent fraud, security incidents and illegal activities;
manage inquiries, claims or requests from Users;
perform statistical analysis, usage measurement and service improvements;
send notifications, alerts or communications related to the Services;
send promotional or advertising information, only when the User has given express consent.
The User may request at any time the suspension of commercial communications without affecting the provision of contracted Services.

6. LEGAL BASIS FOR PROCESSING
The processing of Users' personal data is based on one or more of the following legal bases:

execution of a contract: processing is necessary to provide the Services or execute the conditions accepted by the User;
compliance with legal obligations: when applicable regulations require retaining or communicating certain data;
consent: the User authorizes in a free, express and informed manner the processing of their data under the terms of this Policy;
legitimate interest: when necessary to ensure Platform security, prevent fraud or improve Services.

7. COMMUNICATION AND TRANSFER OF DATA TO THIRD PARTIES
Kioscoin may share personal data only in the following cases:

service providers: companies that provide technological, cloud storage, analytics, security, customer service or operational support services;
competent authorities: public, judicial or administrative bodies that require it in the exercise of their functions or in accordance with the law;
commercial partners: when necessary for the execution of operations authorized by the User or for the joint provision of certain Services.
In all cases, Kioscoin will require third parties to comply with confidentiality obligations and appropriate security measures in accordance with current legislation.

Personal data will not be sold, rented or transferred to third parties for purposes other than those mentioned in this Policy.

8. INTERNATIONAL DATA TRANSFERS
Kioscoin may store or process personal data on servers located outside the Argentine Republic.

In such cases, it will ensure that recipient countries offer adequate levels of protection or that the providers involved subscribe to standard contractual clauses and maintain standards equivalent to those established by Law 25.326 and the European Union General Data Protection Regulation (GDPR).

9. SECURITY AND CONFIDENTIALITY
Kioscoin adopts reasonable technical, organizational and administrative security measures to protect personal data against unauthorized access, loss, misuse, alteration or destruction.

These include:

data and connection encryption (SSL/TLS);
restricted access control;
internal privacy and confidentiality policies;
periodic security audits and testing;
training of authorized personnel.
However, the User acknowledges that no system is completely invulnerable and that data transmission over the Internet involves certain risks.

10. DATA RETENTION
Personal data will be retained for the time necessary to fulfill the purposes for which they were collected and in accordance with the deadlines provided by current legislation.

Once this period has expired, the data will be deleted or anonymized securely, unless they must be retained by legal mandate or for the defense of Kioscoin's rights.

11. USER RIGHTS
The User may exercise at any time the rights recognized by Law 25.326, in particular:

access: know what data Kioscoin has about them;
rectification: request correction or updating of inaccurate or incomplete data;
deletion: request deletion of their personal data when appropriate;
opposition: object to the processing of their data in certain cases;
revocation of consent: withdraw their authorization for the use of data.
The Agency for Access to Public Information (AAIP), with address at Av. Pte. Gral. Julio A. Roca 710, 3rd floor, Autonomous City of Buenos Aires, is the enforcement authority of Law 25.326 and is responsible for handling complaints and claims related to personal data protection.

12. COOKIES AND SIMILAR TECHNOLOGIES
Kioscoin uses cookies and other similar technologies to improve Users' experience, analyze usage patterns and optimize site functionality.

The User can configure their browser to reject cookies or receive alerts when they are sent, although in some cases this may affect the operation of certain site functionalities.

13. POLICY MODIFICATIONS
Kioscoin may modify this Privacy Policy at any time. Modifications will take effect from their publication on the Platform, unless otherwise indicated.

Users will be informed in case of substantial changes that may affect their rights or the way we treat their data.

14. APPLICABLE LAW AND JURISDICTION
This Policy is governed by the laws of the Argentine Republic.

Any controversy related to its interpretation, validity or execution will be submitted to the ordinary courts with seat in the Autonomous City of Buenos Aires.`;

  // Privacy Policy - Spanish
  const privacyPolicyTextES = `POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES
Última actualización: Octubre 2025

1. INTRODUCCIÓN
La presente Política de Privacidad (la "Política") describe cómo BEEFIVE S.A.S. ("Kioscoin", "nosotros", "nuestro" o "la Plataforma") recopila, utiliza, almacena, comparte y protege la información personal de las personas ("Usuarios") que acceden, utilizan o interactúan con nuestros sitios web, aplicaciones, servicios y productos digitales (en conjunto, los "Servicios").

Kioscoin opera bajo la marca Kioscoin, disponible a través del dominio kioscoin.com, incluyendo sus sitios web, aplicaciones y plataformas relacionadas.

Kioscoin reconoce la importancia de proteger los datos personales de sus Usuarios y se compromete a tratarlos con confidencialidad, seguridad y de conformidad con la Ley N.º 25.326 de Protección de los Datos Personales y su normativa complementaria.

El acceso o uso de los Servicios implica la aceptación expresa de esta Política.

2. RESPONSABLE DEL TRATAMIENTO DE LOS DATOS
El responsable del tratamiento de los datos personales es BEEFIVE S.A.S., con domicilio en Ciudad de Mendoza, Argentina.

3. ALCANCE Y APLICACIÓN
Esta Política aplica a todos los datos personales recolectados por Kioscoin a través de:

sus sitios web y plataformas digitales (kioscoin.com);
sus aplicaciones móviles;
los formularios de contacto o registro; y
cualquier otro canal mediante el cual los Usuarios interactúen con la Plataforma.
No aplica a sitios web, servicios o plataformas de terceros a los que el Usuario pueda acceder a través de enlaces desde Kioscoin. En tales casos, se aplicarán las políticas de privacidad propias de dichos terceros.

4. DATOS PERSONALES QUE RECOPILAMOS
Kioscoin únicamente recopila y trata los siguientes datos personales:

a) Correo electrónico: Kioscoin recopila el correo electrónico proporcionado por el Usuario durante el registro y solicita la verificación del mismo. Este es el único dato de identificación personal que recopila Kioscoin.

b) Datos de navegación y uso: información sobre el dispositivo, dirección IP, tipo de navegador, sistema operativo, logs de acceso, fecha y hora de conexión, cookies, ubicación aproximada y patrones de uso o interacción con la Plataforma.

ACLARACIÓN IMPORTANTE SOBRE LOS SERVICIOS DE KIOSCOIN
Kioscoin no brinda servicios financieros ni custodia activos digitales. Kioscoin únicamente provee infraestructura tecnológica que permite a los usuarios operar bajo su propio riesgo a través de un contrato inteligente auditado y verificado públicamente en blockchain. Kioscoin actúa exclusivamente como proveedor de software y no actúa como intermediario financiero, custodio o contraparte en ninguna transacción.

Kioscoin no solicita ni trata datos sensibles, salvo en los casos en que resulte estrictamente necesario para el cumplimiento de obligaciones legales o contractuales.

5. FINALIDADES DEL TRATAMIENTO
Los datos personales son tratados con las siguientes finalidades:

permitir la creación, administración y mantenimiento de las cuentas de Usuario;
brindar, operar y mejorar los Servicios ofrecidos por Kioscoin;
procesar transacciones, pagos y operaciones dentro de la Plataforma;
cumplir con obligaciones legales, regulatorias o contractuales;
prevenir fraudes, incidentes de seguridad y actividades ilícitas;
gestionar consultas, reclamos o solicitudes de los Usuarios;
realizar análisis estadísticos, medición de uso y mejoras del servicio;
enviar notificaciones, alertas o comunicaciones relacionadas con los Servicios;
enviar información promocional o publicitaria, únicamente cuando el Usuario haya prestado su consentimiento expreso.
El Usuario podrá solicitar en cualquier momento la suspensión de comunicaciones comerciales sin afectar la prestación de los Servicios contratados.

6. BASE LEGAL PARA EL TRATAMIENTO
El tratamiento de los datos personales de los Usuarios se basa en una o más de las siguientes bases legales:

ejecución de un contrato: el tratamiento es necesario para prestar los Servicios o ejecutar las condiciones aceptadas por el Usuario;
cumplimiento de obligaciones legales: cuando la normativa aplicable exija conservar o comunicar determinados datos;
consentimiento: el Usuario autoriza de forma libre, expresa e informada el tratamiento de sus datos en los términos de esta Política;
interés legítimo: cuando sea necesario para garantizar la seguridad de la Plataforma, prevenir fraudes o mejorar los Servicios.

7. COMUNICACIÓN Y CESión DE DATOS A TERCEROS
Kioscoin podrá compartir datos personales únicamente en los siguientes casos:

proveedores de servicios: empresas que prestan servicios tecnológicos, de almacenamiento en la nube, análisis, seguridad, atención al cliente o soporte operativo;
autoridades competentes: organismos públicos, judiciales o administrativos que lo requieran en el ejercicio de sus funciones o conforme a la ley;
socios comerciales: cuando sea necesario para la ejecución de operaciones autorizadas por el Usuario o para la prestación conjunta de determinados Servicios.
En todos los casos, Kioscoin exigirá a los terceros el cumplimiento de las obligaciones de confidencialidad y las medidas de seguridad adecuadas conforme a la legislación vigente.

Los datos personales no serán vendidos, alquilados ni transferidos a terceros con fines distintos a los mencionados en esta Política.

8. TRANSFERENCIAS INTERNACIONALES DE DATOS
Kioscoin podrá almacenar o procesar datos personales en servidores ubicados fuera de la República Argentina.

En tales casos, se asegurará que los países receptores ofrezcan niveles adecuados de protección o que los proveedores involucrados suscriban cláusulas contractuales tipo y mantengan estándares equivalentes a los establecidos por la Ley 25.326 y el Reglamento General de Protección de Datos de la Unión Europea (GDPR).

9. SEGURIDAD Y CONFIDENCIALIDAD
Kioscoin adopta medidas de seguridad técnicas, organizativas y administrativas razonables para proteger los datos personales frente a accesos no autorizados, pérdida, uso indebido, alteración o destrucción.

Entre ellas se incluyen:

cifrado de datos y conexiones seguras (SSL/TLS);
control de acceso restringido;
políticas internas de privacidad y confidencialidad;
auditorías y pruebas de seguridad periódicas;
capacitación al personal autorizado.
No obstante, el Usuario reconoce que ningún sistema es completamente invulnerable y que la transmisión de datos por Internet implica cierto riesgo.

10. CONSERVACIÓN DE LOS DATOS
Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades para las cuales fueron recolectados y conforme a los plazos previstos por la legislación vigente.

Una vez vencido dicho plazo, los datos serán eliminados o anonimizados de manera segura, salvo que deban conservarse por mandato legal o para la defensa de derechos de Kioscoin.

11. DERECHOS DE LOS USUARIOS
El Usuario podrá ejercer en cualquier momento los derechos reconocidos por la Ley 25.326, en particular:

acceso: conocer qué datos posee Kioscoin sobre su persona;
rectificación: solicitar la corrección o actualización de datos inexactos o incompletos;
supresión: pedir la eliminación de sus datos personales cuando corresponda;
oposición: oponerse al tratamiento de sus datos en determinados casos;
revocación del consentimiento: retirar su autorización para el uso de los datos.
La Agencia de Acceso a la Información Pública (AAIP), con domicilio en Av. Pte. Gral. Julio A. Roca 710, piso 3°, Ciudad Autónoma de Buenos Aires, es la autoridad de aplicación de la Ley 25.326 y tiene a su cargo la atención de denuncias y reclamos relacionados con la protección de datos personales.

12. COOKIES Y TECNOLOGÍAS SIMILARES
Kioscoin utiliza cookies y otras tecnologías similares para mejorar la experiencia de los Usuarios, analizar patrones de uso y optimizar la funcionalidad del sitio.

El Usuario puede configurar su navegador para rechazar las cookies o recibir alertas cuando se envíen, aunque en algunos casos esto podría afectar el funcionamiento de ciertas funcionalidades del sitio.

13. MODIFICACIONES A LA POLÍTICA
Kioscoin podrá modificar esta Política de Privacidad en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en la Plataforma, salvo que se indique lo contrario.

Se informará a los Usuarios en caso de cambios sustanciales que puedan afectar sus derechos o el modo en que tratamos sus datos.

14. LEY APLICABLE Y JURISDICCIÓN
Esta Política se rige por las leyes de la República Argentina.

Toda controversia relacionada con su interpretación, validez o ejecución será sometida a los tribunales ordinarios con asiento en la Ciudad Autónoma de Buenos Aires.`;

  // Get texts based on language
  const termsAndConditionsText = language === "en" ? termsAndConditionsTextEN : termsAndConditionsTextES;
  const privacyPolicyText = language === "en" ? privacyPolicyTextEN : privacyPolicyTextES;
  
  // Translations for UI elements
  const translations = {
    en: {
      title: "Terms and Conditions - Privacy Policy",
      termsTitle: "Terms and Conditions",
      privacyTitle: "Privacy Policy",
      checkboxText: "I have read the Terms and Conditions and Privacy Policy",
      scrollMessage: "Scroll to the bottom to continue",
      accept: "Accept",
    },
    es: {
      title: "Términos y Condiciones - Política de Privacidad",
      termsTitle: "Términos y Condiciones",
      privacyTitle: "Política de Privacidad",
      checkboxText: "He leído los Términos y Condiciones y la Política de Privacidad",
      scrollMessage: "Desplázate hasta el final para continuar",
      accept: "Aceptar",
    },
  };

  const t = translations[language];

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
      setIsAtBottom(isScrolledToBottom);
    }
  };

  // Check scroll position on mount and when content changes
  useEffect(() => {
    // Initial check
    const timer = setTimeout(handleScroll, 100);
    
    // Re-check when window resizes
    window.addEventListener('resize', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleAccept = () => {
    if (hasRead && isAtBottom) {
      setIsOpen(false);
      onComplete();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Call onClose (logout) when user closes with X - only if onClose is provided
    // If onClose is not provided, just close the modal
    if (onClose) {
      onClose();
    } else {
      // If no onClose provided, just call onComplete to close
      onComplete();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasRead(e.target.checked);
  };

  return (
    <Dialog 
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing via X button (which calls handleClose)
        // Prevent ESC and outside click from closing
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 font-secondary"
        onEscapeKeyDown={(e) => {
          // If readOnly, allow ESC to close. Otherwise, prevent (must accept terms)
          if (!readOnly) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // If readOnly, allow outside click to close. Otherwise, prevent (must accept terms)
          if (!readOnly) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // If readOnly, allow outside interaction to close. Otherwise, prevent (must accept terms)
          if (!readOnly) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b relative">
          <div className="flex items-center justify-center gap-3">
            {/* Language switcher button */}
            <button
              onClick={() => setLanguage(language === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-primary/30 rounded-md flex-shrink-0"
              aria-label="Change language"
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="font-secondary">{language === "en" ? "ESP" : "ENG"}</span>
            </button>
            <DialogTitle className="text-lg text-center text-primary font-secondary min-w-[280px] max-w-[400px]">
              {t.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          {/* Terms and Conditions Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary font-secondary">
                {t.termsTitle}
              </h2>
            </div>
            <div className="text-sm text-dark leading-relaxed whitespace-pre-line">
              {termsAndConditionsText}
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary font-secondary">
                {t.privacyTitle}
              </h2>
            </div>
            <div className="text-sm text-dark leading-relaxed whitespace-pre-line">
              {privacyPolicyText}
            </div>
          </section>

          {/* Spacer to ensure content can be scrolled to bottom */}
          <div className="h-4" />
        </div>

        {/* Fixed footer with checkbox and button - only show if not readOnly */}
        {!readOnly && (
          <DialogFooter className="px-6 py-4 border-t bg-background flex-col gap-3 sm:flex-row sm:justify-between">
            {/* Checkbox */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {!isAtBottom && (
                <p className="text-xs text-muted-foreground font-secondary">
                  {t.scrollMessage}
                </p>
              )}
              <label 
                className={`flex items-start gap-2 text-sm font-secondary ${
                  isAtBottom ? "cursor-pointer text-dark" : "cursor-not-allowed text-muted-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasRead}
                  onChange={handleCheckboxChange}
                  disabled={!isAtBottom}
                  className="mt-0.5 w-4 h-4 rounded border-2 border-primary text-secondary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed accent-secondary"
                />
                <span className="flex-1">
                  {t.checkboxText}
                </span>
              </label>
            </div>

            {/* Accept Button */}
            <Button
              onClick={handleAccept}
              disabled={!hasRead || !isAtBottom}
              className="bg-secondary text-white hover:bg-secondary/80 font-secondary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.accept}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
