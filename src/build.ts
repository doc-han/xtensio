import { getXtensioWebpackConfig } from "./config/webpack.config"
import webpack from "webpack"

export default function buildCommand(cwd: string){
  // TODO supposed to run webpack at the cwd
  webpack(getXtensioWebpackConfig(cwd), (err, stats)=> {
    if(err || stats?.hasErrors()){
      console.log(err);
    }else{
      console.log("bundled successfully!");
    }
  })  
}
