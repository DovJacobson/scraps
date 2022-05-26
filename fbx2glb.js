// recursively convert all fbx files into glb files in a sparse replica of the file tree

// typical usage C:/Project/Assets> node fbx2glb.js >log.txt


// requires ezxecutable FBX2glTF from https://github.com/facebookincubator/FBX2glTF/releases
// or https://github.com/V-Sekai/FBX2glTF
// >>> i renamed it to fbx2 on my system

// also you must npm install node-cmd

const nodeCmd = require('node-cmd');



const ls = argstr =>new Promise(  (resolve,reject) =>  
    nodeCmd.run( `dir ${argstr}`, (err, result, stderr) =>{
        if( err && err.code>1 )   reject( err )
        else        resolve( result )
        }));

const lsdir = name=> ls( `"${name}" /a:d-h-s  /b`);
const lsfbx = name=> ls( `"${name}\\*.fbx"    /b`);
                
const md = path =>new Promise(  (resolve,reject) =>  
    nodeCmd.run( `md "${path}"`, (err, result, stderr) =>{
        if( err && err.code>1 )   reject( err )
        else        resolve( result )
        }));


// see note at top bout "fbx2"        
const convert = path =>new Promise(  (resolve,reject) =>  
    nodeCmd.run( `fbx2 -b -d -i"${path}.fbx" -o"${path.replace(".\\", ".\\gtb\\")}"`, (err, result, stderr) =>{
        if( err?.code>0 )   reject( err )
        else                resolve( result )
        }));


const list = str =>new Promise(  (resolve,reject) =>resolve( str ));
    
    


var depth=0;


const dirwalk =  name =>{

        lsfbx( name )                                           // all fbx files in ths folder
        .then ( fbxs=> new Promise( (resolve,reject)=>{
            fbxs=   fbxs.split("\r\n")                          // make into array of file names
                        .filter( str=>str.trim().length )       // no blanks
                        .map(    str=>str.replace(".fbx","") ); // no extensions

            if( !fbxs.length )  return resolve();
            
            md( name.replace(".\\", ".\\gtb\\") )               // ensure output folder exists
            .then( ()=> Promise.all(
                    fbxs.map( f =>
                         convert( name+'\\'+f )             // do the work   
                            .then(console.log) 
                            .catch( console.error )
                            ) ))}))


        .then( ()=> lsdir( name ))                              // child folders
        .then(  dirs=>
                dirs.split("\r\n")
                    .filter( str=> str.trim().length )          // no blank lines
                    .filter( str=>!str.startsWith("."))         // no hidden folders
                    .forEach( d =>
                        dirwalk(   name + `\\` + d  )   ));     //recurse
        };
  

    dirwalk(".");  //start here