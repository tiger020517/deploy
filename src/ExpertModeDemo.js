import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  class: {
    useMaxWidth: false,
  },
});

const ExpertModeDemo = () => {
  // 초기 데이터
  const [code, setCode] = useState(`PROBLEM:
MVP 출시가 늦어지고 있다

DOMAIN:
비즈니스
프론트엔드_개발

ANALYSIS:
WHO: 대학원생 타겟 (가중치 40)
HOW: 웹 서비스 (가중치 30)
WHEN: 3월 19일 마감 (가중치 30)
(Detail): 3월 19일은 학사 일정상 필수

RESOURCE:
(Skill): React
(Component): React-Flow 라이브러리
(Skill): SpringBoot
(Component): JPA 엔티티 설계

SOLUTION:
React와 SpringBoot로 
핵심 기능만 3월 19일까지 
빠르게 배포한다`);

  const [mermaidCode, setMermaidCode] = useState("");
  const mermaidRef = useRef(null);

  const transpileToMermaid = (input) => {
    const lines = input.split("\n");
    
    const buckets = {
      step1: [], // 문제 정의
      step2: [], // 도메인
      step3: [], // 분석
      step4: [], // 리소스
      step5: []  // 솔루션
    };

    let currentStep = "step1";

    lines.forEach((line) => {
      const text = line.trim();
      if (!text) return;

      if (text.startsWith("PROBLEM:")) {
        currentStep = "step1";
        return;
      } else if (text.startsWith("DOMAIN:")) {
        currentStep = "step2";
        return;
      } else if (text.startsWith("ANALYSIS:")) {
        currentStep = "step3";
        return;
      } else if (text.startsWith("RESOURCE:") || text.startsWith("SKILL:")) {
        currentStep = "step4";
        return;
      } else if (text.startsWith("SOLUTION:")) {
        currentStep = "step5";
        return;
      }

      // 특수문자 안전하게 치환
      const safeText = text
        .replace(/:/g, "=")
        .replace(/\(/g, "[")
        .replace(/\)/g, "]");

      buckets[currentStep].push(safeText);
    });

    // 🛠️ [변경됨] direction TB (Top to Bottom) 적용
    // 화살표 방향도 위(Problem)에서 아래(Solution)로 흐르게 조정
    return `classDiagram
    direction BT
    
    class Step1_Problem {
      ${buckets.step1.join("\n      ")}
    }
    
    class Step2_Domain {
      ${buckets.step2.join("\n      ")}
    }

    class Step3_Analysis_Detail {
      ${buckets.step3.join("\n      ")}
    }

    class Step4_Resource_Component {
      ${buckets.step4.join("\n      ")}
    }

    class Step5_Solution {
      ${buckets.step5.join("\n      ")}
    }

    %% 위에서 아래로 흐르는 구조 (Step1이 가장 위)
    Step5_Solution <-- Step4_Resource_Component
    Step4_Resource_Component <-- Step3_Analysis_Detail
    Step3_Analysis_Detail <-- Step2_Domain
    Step2_Domain <-- Step1_Problem
    `;
  };

  useEffect(() => {
    const converted = transpileToMermaid(code);
    setMermaidCode(converted);
  }, [code]);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaidRef.current.removeAttribute("data-processed");
      mermaidRef.current.innerHTML = "";
      try {
        mermaid.render('mermaid-svg-' + Date.now(), mermaidCode).then((result) => {
             mermaidRef.current.innerHTML = result.svg;
        });
      } catch (error) {
        console.error("Rendering failed", error);
      }
    }
  }, [mermaidCode]);

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <header style={{ padding: "10px 20px", background: "#282c34", color: "white", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{margin:0}}>🚀 SynapseFlow: Expert Mode</h3>
        <span style={{fontSize: "0.8rem", color: "#aaa"}}>PROBLEM ↓ DOMAIN ↓ ANALYSIS ↓ RESOURCE ↓ SOLUTION</span>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, borderRight: "1px solid #ccc" }}>
          <Editor
            height="100%"
            defaultLanguage="yaml"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: "on" }}
          />
        </div>

        <div style={{ flex: 1, padding: "20px", background: "#fff", overflow: "auto", display:"flex", flexDirection:"column" }}>
          <div style={{ marginBottom: "10px", fontWeight: "bold", color: "#333", borderBottom:"2px solid #333", paddingBottom:"5px" }}>
            Vertical Thinking Structure (Top-Down)
          </div>
          <div 
            ref={mermaidRef} 
            className="mermaid" 
            style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "start" }} // alignItems: start로 변경하여 위쪽부터 보이게 함
          >
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertModeDemo;