"use client";
import {useState} from "react";
import Header from "./Header";import Footer from "./Footer";import TrainInput from "./TrainInput";import {TrainSuggestion} from "../lib/api";
export default function ToolPage({title,description,label,action}:{title:string;description:string;label:string;action:(n:string)=>Promise<unknown>}){
 const [train,setTrain]=useState<TrainSuggestion|null>(null),[data,setData]=useState<unknown>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();if(!train){setError("Select a train from the suggestions.");return}setError("");setLoading(true);try{setData(await action(train.train_number))}catch(err){setError(err instanceof Error?err.message:"Something went wrong.")}finally{setLoading(false)}}
 return <><Header/><main className="tool-page"><section className="tool-hero"><div className="eyebrow">RAILSARTHI TOOL</div><h1>{title}</h1><p>{description}</p></section><section className="tool-card"><form onSubmit={submit}><TrainInput value={train} onChange={setTrain}/><button className="primary-btn wide" disabled={loading}>{loading?"LOADING...":label}</button></form>{error&&<div className="error-box">{error}</div>}{data!==null&&<div className="result-card"><pre>{JSON.stringify(data,null,2)}</pre></div>}</section></main><Footer/></>;
}
