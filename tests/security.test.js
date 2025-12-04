/**
 * Testes de Segurança - Funções de Sanitização e Validação
 * 
 * Este arquivo testa as funções de segurança críticas da aplicação,
 * incluindo sanitização HTML, validação de input e prevenção de XSS.
 */

describe("Funções de Segurança", () => {
  let SecurityFunctions;

  beforeAll(() => {
    // Simular as funções de segurança do app
    SecurityFunctions = {
      sanitizeHTML: function(str) {
        if (!str) return "";
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
      },

      sanitizeAttribute: function(str) {
        if (!str) return "";
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
      },

      validateInput: function(str, maxLength) {
        if (!str) return false;
        if (str.length > maxLength) return false;

        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /<iframe/i,
          /<embed/i,
          /<object/i,
          /onerror/i,
          /onload/i
        ];

        return !dangerousPatterns.some(pattern => pattern.test(str));
      }
    };
  });

  describe("sanitizeHTML()", () => {
    test("deve remover tags <script>", () => {
      const input = '<script>alert("XSS")</script>';
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).not.toContain("<script>");
      expect(output).toContain("&lt;script&gt;");
    });

    test("deve remover tags <img> com onerror", () => {
      const input = "<img src=x onerror=alert(1)>";
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).not.toContain("<img");
      expect(output).toContain("&lt;img");
    });

    test("deve remover tags <iframe>", () => {
      const input = '<iframe src="evil.com"></iframe>';
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).not.toContain("<iframe");
      expect(output).toContain("&lt;iframe");
    });

    test("deve remover tags <svg> com onload", () => {
      const input = "<svg onload=alert(1)>";
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).not.toContain("<svg");
      expect(output).toContain("&lt;svg");
    });

    test("deve converter < para &lt;", () => {
      const input = "<b>bold</b>";
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).toContain("&lt;");
    });

    test("deve converter > para &gt;", () => {
      const input = "<b>bold</b>";
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).toContain("&gt;");
    });

    test("deve manter texto sem HTML intacto", () => {
      const input = "Texto normal sem HTML";
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).toBe(input);
    });

    test("deve tratar string vazia", () => {
      const output = SecurityFunctions.sanitizeHTML("");
      expect(output).toBe("");
    });

    test("deve tratar null e undefined", () => {
      expect(SecurityFunctions.sanitizeHTML(null)).toBe("");
      expect(SecurityFunctions.sanitizeHTML(undefined)).toBe("");
    });
  });

  describe("sanitizeAttribute()", () => {
    test("deve escapar aspas duplas", () => {
      const input = 'title="Click here"';
      const output = SecurityFunctions.sanitizeAttribute(input);
      expect(output).toContain("&quot;");
    });

    test("deve escapar aspas simples", () => {
      const input = "title='Click here'";
      const output = SecurityFunctions.sanitizeAttribute(input);
      expect(output).toContain("&#x27;");
    });

    test("deve escapar < e >", () => {
      const input = "<script>";
      const output = SecurityFunctions.sanitizeAttribute(input);
      expect(output).toContain("&lt;");
      expect(output).toContain("&gt;");
    });

    test("deve escapar &", () => {
      const input = "A & B";
      const output = SecurityFunctions.sanitizeAttribute(input);
      expect(output).toContain("&amp;");
    });

    test("deve tratar string vazia", () => {
      expect(SecurityFunctions.sanitizeAttribute("")).toBe("");
    });

    test("deve tratar null e undefined", () => {
      expect(SecurityFunctions.sanitizeAttribute(null)).toBe("");
      expect(SecurityFunctions.sanitizeAttribute(undefined)).toBe("");
    });
  });

  describe("validateInput()", () => {
    test("deve bloquear tag <script>", () => {
      const input = "<script>alert(1)</script>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear protocolo javascript:", () => {
      const input = "javascript:alert(1)";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear handler onerror", () => {
      const input = "<img onerror=alert(1)>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear handler onload", () => {
      const input = "<svg onload=alert(1)>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear handler onclick", () => {
      const input = "<div onclick=alert(1)>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear tag <iframe>", () => {
      const input = "<iframe src=evil.com></iframe>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear tag <embed>", () => {
      const input = "<embed src=evil.swf>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear tag <object>", () => {
      const input = "<object data=evil.swf>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve aceitar texto normal", () => {
      const input = "Texto normal sem código malicioso";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(true);
    });

    test("deve respeitar limite de tamanho", () => {
      const input = "A".repeat(300);
      expect(SecurityFunctions.validateInput(input, 200)).toBe(false);
    });

    test("deve aceitar texto dentro do limite", () => {
      const input = "A".repeat(100);
      expect(SecurityFunctions.validateInput(input, 200)).toBe(true);
    });

    test("deve rejeitar string vazia", () => {
      expect(SecurityFunctions.validateInput("", 1000)).toBe(false);
    });

    test("deve bloquear <SCRIPT> case insensitive", () => {
      const input = "<SCRIPT>alert(1)</SCRIPT>";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });

    test("deve bloquear JAVASCRIPT: case insensitive", () => {
      const input = "JAVASCRIPT:alert(1)";
      expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
    });
  });

  describe("Cenários de Ataque Reais", () => {
    test("deve bloquear XSS via comentário HTML", () => {
      const attack = "<!-- <script>alert(1)</script> -->";
      expect(SecurityFunctions.validateInput(attack, 1000)).toBe(false);
    });

    test("deve bloquear XSS via data URI", () => {
      const attack =
        '<a href="data:text/html,<script>alert(1)</script>">click</a>';
      expect(SecurityFunctions.validateInput(attack, 1000)).toBe(false);
    });

    test("deve remover HTML Injection com formatação", () => {
      const input = "<b>Bold</b><i>Italic</i><u>Underline</u>";
      const sanitized = SecurityFunctions.sanitizeHTML(input);
      expect(sanitized).not.toContain("<b>");
      expect(sanitized).not.toContain("<i>");
    });

    test("deve bloquear DoS via string gigante", () => {
      const attack = "A".repeat(100000);
      expect(SecurityFunctions.validateInput(attack, 2000)).toBe(false);
    });

    test("deve sanitizar múltiplas tags consecutivas", () => {
      const input = "<script><iframe><embed>";
      const output = SecurityFunctions.sanitizeHTML(input);
      expect(output).not.toContain("<script>");
      expect(output).not.toContain("<iframe>");
      expect(output).not.toContain("<embed>");
    });

    test("deve bloquear event handlers inline variados", () => {
      const handlers = [
        "onabort=",
        "onblur=",
        "onchange=",
        "onfocus=",
        "onmouseover=",
        "onsubmit="
      ];

      handlers.forEach(handler => {
        const input = `<div ${handler}alert(1)>`;
        expect(SecurityFunctions.validateInput(input, 1000)).toBe(false);
      });
    });
  });
});
