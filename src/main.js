import arg from 'arg';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { getAcceptor, getAverageBondLength, getBonds, getDonor, getFormula, getIUPACName, getLogP, getLogS, getMolFile, getPolarSurfaceArea, getRotatableBond, getStereoCenter, getWeight, molToSmiles } from 'aromaticity-core';
import { version } from '../package.json';

function parseArgumentsIntoOptions(rawArgs){
    const args = arg(
        {
            '--acceptor': Boolean,
            '--average-bond-length': Boolean,
            '--bonds': Boolean,
            '--donor': Boolean,
            '--export': Boolean,
            '--formula': Boolean,
            '--help': Boolean,
            '--import': Boolean,
            '--logP': Boolean,
            '--logS': Boolean,
            '--name': Boolean,
            '--non-hydrogen-bonds-only' : Boolean,
            '--polar-surface-area': Boolean,
            '--rotatable-bond': Boolean,
            '--stereo-center': Boolean,
            '--version': Boolean,
            '--weight': Boolean,
            '-e': '--export',
            '-i': '--import',
            '-h': '--help',
            '-v': '--version'
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return{
        import: args._[0],
        acceptor: args['--acceptor'] || false,
        averageBondLength: args['--average-bond-length'] || false,
        bonds: args['--bonds'] || false,
        donor: args['--donor'] || false,
        export: args['--export'] || false,
        formula: args['--formula'] || false,
        help: args['--help'] || false,
        logP: args['--logP'] || false,
        logS: args['--logS'] || false,
        name: args['--name'] || false,
        nonHydrogenBondsOnly: args['--non-hydrogen-bonds-only'] || false,
        polarSurfaceArea: args['--polar-surface-area'] || false,
        rotatableBond: args['--rotatable-bond'] || false,
        stereoCenter: args['--stereo-center'] || false,
        version: args['--version'] || false,
        weight: args['--weight'] || false,
    };
}

async function promptForMissingOptions(options){
    
    const questions = [];
    if(options.import === undefined && !options.version && !options.help && !options.import){
        questions.push({
            type: 'string',
            name: 'import',
            message: 'Please insert a SMILES',
        })
    }

    const answers = await inquirer.prompt(questions);
    return{
        ... options,
        import: options.import || answers.import
    };
    
}

export async function cli(args){
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options)
    var mol;
    var smiles;

    if(options.version){
        console.log(`%s v${version} \n\nLicense: GPL-3.0\nGitHub Repository: https://github.com/themagiulio/aromaticity_cli\nWebsite: https://aromaticity.io/cli \n\nDeveloped by Giulio De Matteis`, chalk.magentaBright.bold('aromaticity CLI'))
        return;
    }

    if(options.help){
        console.log("%s \n\nUsage: \naromaticity <SMILES> or <MOLFILE PATH>[--option]\nor just\naromaticity [--option]\n\nIf you choose the second way, you will need to specify the SMILES in a second moment.\n\nIf you use --help (-h) or --version (-v) you don't need to specify SMILES or MOLFILE PATH.\n\n--acceptor                  It returns the acceptor number.\n--average-bond-length       It returns the average bond length (you can remove the hydrogen bonds from calculations using --non-hydrogen-bonds-only).\n--bonds                     It returns the bonds number (bonds connecting plain-H atoms are not included).\n--donor                     It returns the donor number.\n-e, --export                Export the compound as MolFile.\n--formula                   It returns the molecular formula.\n-h, --help                  It shows this help message.\n--logP                      It returns the LogP.\n--logS                      It returns the LogS.\n--name                      It returns the IUPAC Name.\n--non-hydrogen-bonds-only   Use this option to remove hydrogen bonds from specific calculations.\n--polar-surface-area        It returns the polar surface area.\n--rotatable-bond            It returns the rotatable bond number.\n--stereo-center             It returns the stereo center number.\n-v, --version               It returns the version of aromaticity CLI.\n--weight                    It returns the molecular weight.", chalk.magentaBright.bold('aromaticity CLI'))
        return;
    }


     if(fs.existsSync(options.import)){
        mol = molFileToMol(fs.readFileSync(options.import, 'utf8'));
        smiles = molToSmiles(mol);
    }else{
        smiles = options.import;
    }

    if(options.acceptor){
        await console.log(`%s ${getAcceptor(smiles)}`, chalk.green.bold('ACCEPTOR'));
    }

    if(options.averageBondLength){
        await console.log(`%s ${getAverageBondLength(smiles, options.nonHydrogenBondsOnly)}`, chalk.green.bold('AVERAGE BOND LENGTH'));
    }

    if(options.bonds){
        await console.log(`%s ${getBonds(smiles)}`, chalk.green.bold('BONDS'))
    }

    if(options.donor){
        await console.log(`%s ${getDonor(smiles)}`, chalk.green.bold('DONOR'));
    }
    
    if(options.formula){
        await console.log(`%s ${getFormula(smiles)}`, chalk.green.bold('MOLECULAR FORMULA'));
    }

    if(options.logP){
        await console.log(`%s ${getLogP(smiles)}`, chalk.green.bold('LOGP'));
    }

    if(options.logS){
        await console.log(`%s ${getLogS(smiles)}`, chalk.green.bold('LOGS'));
    }

    if(options.name){
        await getIUPACName(smiles, (IUPACName) => {
            console.log(`%s ${IUPACName}`, chalk.green.bold('IUPAC NAME'));
        });
    }

    if(options.polarSurfaceArea){
        await console.log(`%s ${getPolarSurfaceArea(smiles)}`, chalk.green.bold('POLAR SURFACE AREA'));
    }

    if(options.rotatableBond){
        await console.log(`%s ${getRotatableBond(smiles)}`, chalk.green.bold('ROTATABLE BOND'));
    }

    if(options.stereoCenter){
        await console.log(`%s ${getStereoCenter(smiles)}`, chalk.green.bold('STEREO CENTER'));
    }

    if(options.weight){
        await console.log(`%s ${getWeight(smiles)}`, chalk.green.bold('MOLECULAR WEIGHT'));
    }

    if(options.export){

        const questions = [];
        
        questions.push({
            type: 'list',
            name: 'molFileType',
            choices: ['V2000', 'V3000'],
            message: 'Please select a MolFile Type',
        })

        questions.push({
            type: 'string',
            name: 'molFileName',
            message: 'Please insert the name of the MolFile',
            default: 'untitled.mol'
        })
    
        const answers = await inquirer.prompt(questions);

        let molFileType;

        if(answers.molFileType == 'V2000'){
            molFileType = false;
        }else{
            molFileType = true;
        }

        var molFileText = getMolFile(smiles, molFileType);
        var molFile = path.join(process.cwd(), answers.molFileName);

        fs.writeFile(molFile, molFileText, function(){
            console.log(`%s The MolFile has been successfully exported to: ${molFile}`, chalk.green.bold('EXPORT MOLFILE'));
        })
    } 
}