const bloodTypeGenotypes = {
    'A+': { abo: ['AA','AO'], rh: ['DD','Dd'] },
    'A-': { abo: ['AA', 'AO'], rh: ['dd'] },
    'B+': { abo: ['BB', 'BO'], rh: ['DD', 'Dd'] },
    'B-': { abo: ['BB', 'BO'], rh: ['dd'] },
    'AB+': { abo: ['AB'], rh: ['DD', 'Dd'] },
    'AB-': { abo: ['AB'], rh: ['dd'] },
    'O+': { abo: ['OO'], rh: ['DD', 'Dd'] },
    'O-': { abo: ['OO'], rh: ['dd'] }
};

function getAllelePairs(genotype){
    if(genotype.length === 2){
        return [genotype[0],genotype[1]];
    }
    return [];
}

function calculateOffspringGenotypes(parent1Genotypes,parent2Genotypes){
    const possibleOffspring ={};

    parent1Genotypes.forEach(p1G => {
        const p1Alleles = getAllelePairs(p1G);
        parent2Genotypes.forEach(p2G => {
            const p2Alleles = getAllelePairs(p2G);

            const combinations = [
                p1Alleles[0] + p2Alleles[0],
                p1Alleles[0] + p2Alleles[1],
                p1Alleles[1] + p2Alleles[0],
                p1Alleles[1] + p2Alleles[1]
            ];

            combinations.forEach( combo => {
                const sortedCombo = combo.split('').sort().join('');
                possibleOffspring[sortedCombo] = (possibleOffspring[sortedCombo] || 0) + 1;
            });
        });
    });

    const totalCombinations = Object.values(possibleOffspring).reduce((sum,count) => sum + count,0);
    const probabilities = {};
    for(const genotype in possibleOffspring){
        probabilities[genotype] = possibleOffspring[genotype] / totalCombinations;
    }
    return probabilities;
}

function getABOPhenoType(genotype){
    if(genotype.includes('A') && genotype.includes('B')) return 'AB';
    if(genotype.includes('A')) return 'A';
    if(genotype.includes('B')) return 'B';
    if(genotype.includes('O')) return 'O';
    return 'Unknown';
}

function getRhPhenotype(genotype){
    if(genotype.includes('D')) return '+';
    if(genotype.includes('d')) return '-';
    return 'Unknown';
}

function simulateInheritance(){
    const motherBloodType = document.getElementById('mother-blood-type').value;
    const fatherBloodType = document.getElementById('father-blood-type').value;
    const resultsList = document.getElementById("resultsList");
    const messageBox = document.getElementById('messageBox');

    resultsList.innerHTML = '';
    messageBox.style.display = 'none';

    const motherABOGenotypes = bloodTypeGenotypes[motherBloodType].abo;
    const motherRhGenotypes = bloodTypeGenotypes[motherBloodType].rh;
    const fatherABOGenotypes = bloodTypeGenotypes[fatherBloodType].abo;
    const fatherRhGenotypes = bloodTypeGenotypes[fatherBloodType].rh;

    const aboProbabilities = calculateOffspringGenotypes(motherABOGenotypes,fatherABOGenotypes);
    const rhProbabilities = calculateOffspringGenotypes(motherRhGenotypes,fatherRhGenotypes);
    const finalResults = {};

    for(const aboGenotype in aboProbabilities){
        const aboPhenotype = getABOPhenoType(aboGenotype);
        for(const rhGenotype in rhProbabilities){
            const rhPhenotype = getRhPhenotype(rhGenotype);
            
            const combinedBloodType = aboPhenotype + rhPhenotype;
            const combinedProbability = aboProbabilities[aboGenotype] * rhProbabilities[rhGenotype];

            finalResults[combinedBloodType] = (finalResults[combinedBloodType] || 0) + combinedProbability;
        }
    }

    if(Object.keys(finalResults).length === 0){
        messageBox.textContent = 'Could not determine possible blood types. Please check your input.';
        messageBox.style.display = 'block';
        return;
    }

    const sortedResults = Object.entries(finalResults).sort(([typeA],[typeB]) => typeA.localeCompare(typeB));

    sortedResults.forEach(([bloodTypeGenotypes, probability]) => {
        const listItem = document.createElement('li');
        const percentage = (probability * 100).toFixed(2);
        listItem.innerHTML = `<strong>${bloodTypeGenotypes}</strong><span>${percentage}%</span>`;
        resultsList.appendChild(listItem);
    });
}

window.onload = function(){
    document.getElementById('simulateButton').addEventListener('click',simulateInheritance);
    simulateInheritance();
};