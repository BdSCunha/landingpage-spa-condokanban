/**
 * Testes de Armazenamento - SessionStorage
 * 
 * Testa as operações de armazenamento e recuperação de dados
 */

describe("Armazenamento de Dados", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe("Tasks Storage", () => {
    test("deve salvar e recuperar tarefas", () => {
      const tasks = [
        { id: 1, title: "Tarefa 1", status: "pending" },
        { id: 2, title: "Tarefa 2", status: "in-progress" }
      ];

      sessionStorage.setItem("condoTasks", JSON.stringify(tasks));
      const retrieved = JSON.parse(sessionStorage.getItem("condoTasks"));

      expect(retrieved).toEqual(tasks);
      expect(retrieved).toHaveLength(2);
    });

    test("deve retornar null para dados inexistentes", () => {
      const result = sessionStorage.getItem("nonexistent");
      expect(result).toBeNull();
    });

    test("deve limpar todos os dados", () => {
      sessionStorage.setItem("condoTasks", "[]");
      sessionStorage.setItem("condoUsers", "[]");

      sessionStorage.clear();

      expect(sessionStorage.getItem("condoTasks")).toBeNull();
      expect(sessionStorage.getItem("condoUsers")).toBeNull();
    });

    test("deve remover item específico", () => {
      sessionStorage.setItem("task1", "data1");
      sessionStorage.setItem("task2", "data2");

      sessionStorage.removeItem("task1");

      expect(sessionStorage.getItem("task1")).toBeNull();
      expect(sessionStorage.getItem("task2")).toBe("data2");
    });
  });

  describe("Users Storage", () => {
    test("deve salvar e recuperar usuários", () => {
      const users = [
        { id: 1, name: "João", email: "joao@test.com" },
        { id: 2, name: "Maria", email: "maria@test.com" }
      ];

      sessionStorage.setItem("condoUsers", JSON.stringify(users));
      const retrieved = JSON.parse(sessionStorage.getItem("condoUsers"));

      expect(retrieved).toEqual(users);
      expect(retrieved).toHaveLength(2);
    });
  });

  describe("System Logs Storage", () => {
    test("deve salvar logs do sistema", () => {
      const logs = [
        { id: 1, action: "create", timestamp: Date.now() },
        { id: 2, action: "update", timestamp: Date.now() }
      ];

      sessionStorage.setItem("condoSystemLogs", JSON.stringify(logs));
      const retrieved = JSON.parse(sessionStorage.getItem("condoSystemLogs"));

      expect(retrieved).toEqual(logs);
      expect(retrieved).toHaveLength(2);
    });
  });

  describe("Queue Cache", () => {
    test("deve cachear dados da fila inteligente", () => {
      const cacheData = {
        timestamp: Date.now(),
        data: [{ id: 1, score: 85 }]
      };

      sessionStorage.setItem("queueCache", JSON.stringify(cacheData));
      const retrieved = JSON.parse(sessionStorage.getItem("queueCache"));

      expect(retrieved).toEqual(cacheData);
      expect(retrieved.data).toHaveLength(1);
    });

    test("deve validar expiração do cache (24h)", () => {
      const now = Date.now();
      const twentyThreeHoursAgo = now - 23 * 60 * 60 * 1000;
      const twentyFiveHoursAgo = now - 25 * 60 * 60 * 1000;

      const validCache = { timestamp: twentyThreeHoursAgo, data: [] };
      const expiredCache = { timestamp: twentyFiveHoursAgo, data: [] };

      // Cache válido (< 24h)
      const validAge = now - validCache.timestamp;
      expect(validAge).toBeLessThan(24 * 60 * 60 * 1000);

      // Cache expirado (> 24h)
      const expiredAge = now - expiredCache.timestamp;
      expect(expiredAge).toBeGreaterThan(24 * 60 * 60 * 1000);
    });
  });
});
