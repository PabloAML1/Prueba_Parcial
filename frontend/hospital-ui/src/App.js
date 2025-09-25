import './App.css';
import React from "react";
import  ConsultasList from "./components/ConsultasList.jsx";

function App() {
  return (
    <div>
      <h1>Consultas Hospital A</h1>
      <ConsultasList apiUrl="http://localhost:8080/api/hospitalA/consultas" />

      <h1>Consultas Hospital B</h1>
      <ConsultasList apiUrl="http://localhost:8080/api/hospitalB/consultas" />
    </div>
  );
}

export default App;
