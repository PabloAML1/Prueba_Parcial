
import './App.css';
import {  } from "./components/consultasList";
import React from "react";


function App() {
  return (
    <div>
      <h1>Consultas Hospital A</h1>
      <ConsultasList apiUrl="http://localhost:4100/api/consultas" />

      <h1>Consultas Hospital B</h1>
      <ConsultasList apiUrl="http://localhost:4200/api/consultas" />
    </div>
  );
}

export default App;
