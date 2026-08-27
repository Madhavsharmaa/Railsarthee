"use client";
import {useEffect,useRef,useState} from "react";
import {Search,TrainFront,X} from "lucide-react";
import {searchTrains,TrainSuggestion} from "../lib/api";

export default function TrainInput({value,onChange,placeholder="e.g. 12014 or Shatabdi",label="Train number or name"}:{value:TrainSuggestion|null;onChange:(v:TrainSuggestion|null)=>void;placeholder?:string;label?:string}){
  const [text,setText]=useState(value?`${value.train_number} - ${value.train_name||value.eng_train_name||""}`:"");
  const [items,setItems]=useState<TrainSuggestion[]>([]),[open,setOpen]=useState(false),[loading,setLoading]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>setText(value?`${value.train_number} - ${value.train_name||value.eng_train_name||""}`:""),[value]);
  useEffect(()=>{
    if(timer.current)clearTimeout(timer.current);
    if(text.trim().length<3||value){setItems([]);setOpen(false);return;}
    timer.current=setTimeout(async()=>{setLoading(true);try{const x=await searchTrains(text.trim());setItems(Array.isArray(x)?x:[]);setOpen(true)}catch{setItems([])}finally{setLoading(false)}},300);
    return()=>{if(timer.current)clearTimeout(timer.current)};
  },[text,value]);
  return <div className="autocomplete"><label>{label}</label><div className="input-shell"><TrainFront size={17}/><input value={text} placeholder={placeholder} onChange={e=>{setText(e.target.value);if(value)onChange(null)}} onFocus={()=>items.length&&setOpen(true)}/>{text&&<button className="input-clear" onClick={()=>{setText("");onChange(null)}}><X size={15}/></button>}{loading?<span className="spinner"/>:<Search size={16}/>}</div>
  {open&&items.length>0&&<div className="suggestions">{items.map(t=><button key={t.train_number} onClick={()=>{onChange(t);setText(`${t.train_number} - ${t.train_name||t.eng_train_name||""}`);setOpen(false)}}><span className="suggestion-icon"><TrainFront size={15}/></span><span><strong>{t.train_number} — {t.train_name||t.eng_train_name}</strong><small>{t.source?.name||"Source"} → {t.destination?.name||"Destination"}</small></span></button>)}</div>}</div>;
}
