import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "GetMaker <onboarding@resend.dev>";

interface NewProjectEmailProps {
  technicianName: string;
  technicianEmail: string;
  clientName: string;
  description: string;
  cityState?: string | null;
  budgetRange?: string | null;
  urgency?: string | null;
  siteUrl: string;
}

export function buildNewProjectEmail({
  technicianName,
  clientName,
  description,
  cityState,
  budgetRange,
  urgency,
  siteUrl,
}: NewProjectEmailProps): string {
  const urgencyMap: Record<string, string> = {
    high: "🔴 Alta",
    medium: "🟡 Média",
    low: "🟢 Baixa",
  };

  const urgencyLabel = urgency ? urgencyMap[urgency] ?? urgency : null;
  const preview = description.length > 200
    ? description.slice(0, 200) + "..."
    : description;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Novo projeto no GetMaker</title>
</head>
<body style="margin:0;padding:0;background:#F5F8FA;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F8FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#1B1F3B;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #363A5C;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00C2FF;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;line-height:32px;">⚡</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-size:18px;font-weight:700;color:#F5F8FA;">Get</span>
                    <span style="font-size:18px;font-weight:700;color:#00C2FF;">Maker</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;color:#00C2FF;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                Novo projeto disponível
              </p>
              <h1 style="margin:0 0 24px;color:#F5F8FA;font-size:22px;font-weight:700;line-height:1.3;">
                Olá, ${technicianName}! 👋
              </h1>
              <p style="margin:0 0 24px;color:#9CA3C8;font-size:15px;line-height:1.6;">
                Um novo projeto foi enviado por <strong style="color:#F5F8FA;">${clientName}</strong>
                e pode ser do seu interesse.
              </p>

              <!-- Project card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#2D3055;border-radius:12px;margin-bottom:24px;border:1px solid #363A5C;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#F5F8FA;font-size:15px;line-height:1.6;">
                      ${preview}
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      ${cityState ? `
                      <tr>
                        <td style="padding-bottom:6px;">
                          <span style="color:#9CA3C8;font-size:13px;">📍 ${cityState}</span>
                        </td>
                      </tr>` : ""}
                      ${budgetRange ? `
                      <tr>
                        <td style="padding-bottom:6px;">
                          <span style="color:#9CA3C8;font-size:13px;">💰 ${budgetRange}</span>
                        </td>
                      </tr>` : ""}
                      ${urgencyLabel ? `
                      <tr>
                        <td>
                          <span style="color:#9CA3C8;font-size:13px;">Urgência: ${urgencyLabel}</span>
                        </td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}/tecnico"
                      style="display:inline-block;background:#00C2FF;color:#1B1F3B;font-weight:700;
                             font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                      Ver projeto completo →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#4C4F6A;font-size:13px;text-align:center;line-height:1.5;">
                Acesse a plataforma, veja os detalhes e demonstre interesse.<br/>
                O contato do cliente só aparece após o login.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #363A5C;text-align:center;">
              <p style="margin:0;color:#4C4F6A;font-size:12px;">
                GetMaker · Conectamos quem precisa automatizar com quem sabe executar
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
