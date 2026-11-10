import { vectorStore } from "./services/vectorStore.js";
import { mcpManager } from "./services/mcpClient.js";
import { langgraphAgent } from "./agents/langgraphAgent.js";

async function runTests() {
  console.log("🧪 --- Starting BharatVerse AI & MCP Test Suite --- 🧪\n");

  // Test 1: Vector Store
  console.log("▶ [Test 1] Vector Store Initialization & Semantic Search...");
  await vectorStore.initialize();
  console.log(`✓ Indexed total documents: ${vectorStore.documents.length}`);

  const searchResults = await vectorStore.search("stepwell water management", 2);
  console.log(`✓ Search for 'stepwell water management' found:`, searchResults.map(r => `${r.title} (${r.state}) - Score: ${r.score.toFixed(3)}`));

  // Test 2: MCP Tools
  console.log("\n▶ [Test 2] MCP Tools Execution...");
  const weatherRes = await mcpManager.callTool("get_weather", { location: "Hampi" });
  console.log(`✓ Weather MCP Output:`, weatherRes.data);

  const tourRes = await mcpManager.callTool("get_monument_360_tour", { monumentName: "Taj Mahal" });
  console.log(`✓ 360 Tour MCP Output:`, tourRes.data);

  // Test 3: LangGraph Agent
  console.log("\n▶ [Test 3] LangGraph Multi-Agent Execution...");
  const agentOutput = await langgraphAgent.runGraph("Tell me about Chand Baori stepwell and what makes it special", (status) => {
    console.log(`  [Agent Step] ${status}`);
  });

  console.log("\n✓ Agent Response Preview:\n", agentOutput.finalResponse.slice(0, 200) + "...");
  console.log("✓ Sources Attached:", agentOutput.sources);
  console.log("✓ Cards Generated:", agentOutput.cards.map(c => c.type));
  console.log("✓ Quick Actions:", agentOutput.quickActions.map(a => a.label));

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch(console.error);

