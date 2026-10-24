import type { Journey } from "@/types";
export const demoJourneys: Journey[] = [
{id:"demo-metro",name:"Metro + walk",cost:35,minutes:42,walkingKm:0.8,transfers:1,demo:true,segments:[{mode:"Walk",from:"Origin",to:"Metro station",minutes:8,cost:0,verified:false},{mode:"Metro",from:"Origin station",to:"Destination station",minutes:25,cost:25,verified:false},{mode:"Walk",from:"Destination station",to:"Destination",minutes:9,cost:0,verified:false}]},
{id:"demo-auto",name:"Auto",cost:160,minutes:35,walkingKm:0.2,transfers:0,demo:true,segments:[{mode:"Auto",from:"Origin",to:"Destination",minutes:35,cost:160,verified:false}]},
{id:"demo-bus",name:"Bus",cost:25,minutes:58,walkingKm:1.1,transfers:1,demo:true,segments:[{mode:"Walk",from:"Origin",to:"Bus stop",minutes:7,cost:0,verified:false},{mode:"Bus",from:"Bus stop",to:"Destination stop",minutes:42,cost:25,verified:false},{mode:"Walk",from:"Destination stop",to:"Destination",minutes:9,cost:0,verified:false}]}
];
export const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
