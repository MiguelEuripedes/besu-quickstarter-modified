const { ethers } = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();

  // Replace this with your deployed contract address
  const contractAddress = "0x42699A7612A82f1d9C36148af9C77354759b210b";
  
  const code = await ethers.provider.getCode(contractAddress);
  if (code === '0x'){
    console.log('Contract not deployed at this address');
    return;
  } else {
    console.log(`Contract is deployed at address ${contractAddress}.`)
  }

  // Replace this with the ABI of your contract
  const abi = [
    "event TripStored(uint256 tripId, address tripOwner, string distance, uint256 startTime, string startLocation, uint256 timestamp)",
    "function getTrip(uint256 _tripId) view returns (address tripOwner, string startLocation, string endLocation, string distance, string avgRPM, string avgSpeed, string avgEngLoad, uint256 startTime, uint256 endTime, uint256 timestamp)",
    "function storeTrip(string _startLocation, string _endLocation, string _distance, string _avgRPM, string _avgSpeed, string _avgEngLoad, uint256 _startTime, uint256 _endTime)",
    "function tripCounter() view returns (uint256)",
    "function trips(uint256) view returns (uint256 tripId, address tripOwner, string startLocation, string endLocation, string distance, string avgRPM, string avgSpeed, string avgEngLoad, uint256 startTime, uint256 endTime, uint256 timestamp)"
  ];

  const numSubmissions = 5;

  const startLocation = "-5.843611, -35.199049";
  const endLocation = "-5.841978, -35.202699";
  const distance = "10";
  const avgRPM = "1300";
  const avgSpeed = "75"; // km
  const avgEngLoad = "49"; // m/s^2
  const startTime = 1730923208; // Electric car, no CO2 emissions
  const endTime = 1730923350;
  
  // Loop through the number of submissions
  for (let i = 0; i < numSubmissions; i++) {
    // Randomly select a signer from the available signers 
    const signer = signers[i % signers.length];
    
    // Log which account is being used
    console.log(`\nUsing Address: ${signer.address}`);

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Log the trip data (optional)
    console.log(`Submitting trip ${i + 1}.`);
    // Store the data on the blockchain by calling the smart contract
    const tx = await contract.connect(signer).storeTrip(
        startLocation,
        endLocation,
        distance,
        avgRPM,
        avgSpeed,
        avgEngLoad,
        startTime,
        endTime
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Check if events exist and find the TripStored event
    const event = receipt.logs.find(log => {
        try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog.name === "TripStored";
        } catch (e) {
            return false;
        }
    });

    // Check if events exist and find the TripStored event
    if (event) {
        // Log success message for the TripStored event
        console.log(`Trip ${i + 1} stored successfully on the blockchain.`);
        
        // Destructure event arguments
        const { tripId, tripOwner, distance, startTime, startLocation, timestamp } = event.args;

        // Log details from the TripStored event
        console.log(`TripStored Event Emitted:`);
        console.log(`Trip ID: ${tripId}`);  // Convert BigInt to string
        console.log(`Owner: ${tripOwner}`);
        console.log(`Trip Distance: ${distance}`);
        console.log(`Trip start Time: ${startTime}`);
        console.log(`Trip start Location: ${startLocation}`);  // Convert BigInt to string
        console.log(`Timestamp: ${new Date(Number(String(timestamp)) * 1000).toLocaleString()}`);  // Convert BigInt to string and then to number
    } else {
        console.log(`No TripStored event found in the transaction receipt.`);
    }
  }

  console.log(`${numSubmissions} trips submitted successfully!`);

}

// Execute the script
main().catch(console.error);