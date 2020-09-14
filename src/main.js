import chalk from 'chalk';
import * as OCL from 'openchemlib';
import fetchJson from 'fetch-json';

export function smilesToMol(smiles){
    return OCL.Molecule.fromSmiles(smiles);
}

export function molFileToMol(molFile){
    return OCL.Molecule.fromMolfile(molFile);
}

export function getAcceptor(mol){
    return new OCL.MoleculeProperties(mol).acceptorCount;
}

export function getAverageBondLength(mol, nonHydrogenBondsOnly = false){
    return mol.getAverageBondLength(nonHydrogenBondsOnly);
}

export function getBonds(mol){
    return mol.getBonds();
}

export function getDonor(mol){
    return new OCL.MoleculeProperties(mol).donorCount;
}

export function getFormula(mol){
    return mol.getMolecularFormula().formula;
}

export function getLogP(mol){
    return new OCL.MoleculeProperties(mol).logP;
}

export function getLogS(mol){
    return new OCL.MoleculeProperties(mol).logS;
}

export function getMolFile(mol, type){
    const oldTitle = 'Actelion Java MolfileCreator';
    const title = 'aromaticity MolFile';
    if(type == 'V2000'){
        return mol.toMolfile().replace(oldTitle+' 1.0', title);
    }else if(type == 'V3000'){
        return mol.toMolfileV3().replace(oldTitle+' 2.0', title);
    }
}

export function getPolarSurfaceArea(mol){
    return new OCL.MoleculeProperties(mol).polarSurfaceArea;
}
  
export function getRotatableBond(mol){
    return new OCL.MoleculeProperties(mol).rotatableBondCount;
}
  
export function getStereoCenter(mol){
    return mol.getStereoCenterCount();
}

export function getWeight(mol){
    return mol.getMolweight();
}

async function handleData(data){
    var iupacname =  await data.PropertyTable.Properties[0].IUPACName;
    return iupacname;
}

export async function getIUPACName(smiles){
    try{
        const url = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/'+smiles+'/property/IUPACName/JSON';
        const params = {};
        fetchJson.get(url, params)
        .then(async function(data){
            var iupacname =  await data.PropertyTable.Properties[0].IUPACName;
            await console.log('%s '+iupacname, chalk.green.bold('IUPAC NAME'));
        });
      }catch{
        return 'Error';
      }  
}