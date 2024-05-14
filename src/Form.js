// src/Form.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from './supabaseClient'



const Form = ({ onDataParsed, onContributionComplete }) => {
  const [file, setFile] = useState(null);
  const [organisationName, setOrganisationName] = useState('');
  const [isDataReadyForUpload, setIsDataReadyForUpload] = useState(false);
  const [transformedData, setTransformedData] = useState([]);
  const [hasContributed, setHasContributed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleOrganisationChange = (event) => {
    setOrganisationName(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file before submitting.');
      return;
    }

    Papa.parse(file, {
      complete: async (results) => {
        console.log('Organisation Name:', organisationName);
        console.log('File parsed:', results.data);
        const transformed = await transformDataForSupabase(results.data);
        console.log('Transformed Data',transformed);
        setTransformedData(transformed); // Store transformed data for later use
        onDataParsed(transformed); // Visualize transformed data immediately
        setIsDataReadyForUpload(true); // Indicate that data is ready for upload
      },
      header: true,
    });
  };

  const handleContributeClick = async () => {
    // Utilize transformedData and organisationName for Supabase upload
    await insertDataToSupabase(organisationName, transformedData);
    setHasContributed(true); // Indicate that contribution has been made
    onContributionComplete();
  };

  async function insertOrganisationAndGetId(organisationName) {
    try {
      
        // Check if the organisation already exists
        const { data: existingOrg, error: findError } = await supabase
            .from('organisations')
            .select('id')
            .eq('name', organisationName)
            .maybeSingle();
            

        if (findError) {
            console.error('Error checking for existing organisation:', findError);
            return null;
        }

        // If the organisation exists, return its ID
        if (existingOrg) {
            return existingOrg.id;
            
        }

        // If the organisation doesn't exist, insert it
        const { data: newOrg, error: insertError } = await supabase
            .from('organisations')
            .insert([{ name: organisationName }])
            .select('id')
            .single()
        

            console.log('Insert response', newOrg);

        if (insertError) {
            console.error('Error inserting new organisation:', insertError);
            return null;
        }

        if (newOrg) {
          console.log('newOrg', newOrg);
          return newOrg.id;
        } else {
            console.error('Unexpected null response from new organisation insert operation.');
            return null;
        }

    } catch (error) {
        console.error('Error finding or inserting organisation:', error);
        return null;
    }
}

const transformDataForSupabase = async (parsedData) => {
  setLoading(true);
  setErrorMessage('');

  const dataWithLocalAuthority = await Promise.all(parsedData.map(async (item) => {
    let localAuthority = '';
    if (item["Postcode"]) {
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${item["Postcode"]}`);
        if (!response.ok) throw new Error('Failed to fetch postcode data');
        const data = await response.json();
        localAuthority = data.result.admin_district;
      } catch (error) {
        console.error('Error fetching postcode data:', error);
        setErrorMessage(`Failed to fetch data for postcode: ${item["Postcode"]}`);
      }
    }
    return {
      activity: item["Activity"],
      age_range: item["Age Range"],
      date: convertDateToISO(item["Date"]),
      number_of_people: parseInt(item["Number of people"], 10),
      postcode: item["Postcode"],
      type_of_insight: item["Type of insight"],
      location: item["What approximate location does this relate to?"],
      local_authority: localAuthority
    };
  }));

  setLoading(false);
  return dataWithLocalAuthority;
};

  function convertDateToISO(dateString) {
    const parts = dateString.split("/");
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Assuming the format is DD/MM/YYYY
  }

  const insertDataToSupabase = async (organisationName, transformedData) => {
 // Insert the organisation and get its ID
 
 const organisationId = await insertOrganisationAndGetId(organisationName);
 console.log('Retrieved Organisation ID:', organisationId);

 if (!organisationId) {
   console.error('Failed to get or insert organisation ID.');
   return;
 }

 // Add organisation_id to each item of the transformed data
 const dataWithOrganisationId = transformedData.map(item => ({
   ...item,
   organisation_id: organisationId, 
 }));

 console.log('Inserting Transformed Data to Supabase:', dataWithOrganisationId);
 
 // Insert the data into "main_data" table
 const { data, error } = await supabase
   .from('main_data')
   .insert(dataWithOrganisationId);

 if (error) {
   console.error('Error inserting data into Supabase:', error);
   return;
 }

 console.log('Data inserted successfully:', data);
};

return (
  <div className="flex flex-col items-center h-auto mt-4 mb-5 "> 
    <h1 className='text-xl font-semibold text-white mb-5'>Visualise your csv - it doesn't leave your browser unless you click contribute</h1>
    <div className="w-full max-w-xs">
    {loading && <p>Loading postcode information...</p>}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ">
          <div className="mb-4">
          <label htmlFor="organisation-name" className="block text-gray-700 text-sm font-bold mb-2">
            Organisation Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="organisation-name"
            type="text"
            placeholder="Organisation Name"
            value={organisationName}
            onChange={handleOrganisationChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="csv-upload" className="block text-gray-700 text-sm font-bold mb-2">
            Upload CSV
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline cursor-pointer"
            id="csv-upload"
            type="file"
            onChange={handleFileChange}
            accept=".csv"
          />
        </div>
           <div className="flex items-center justify-between space-x-4">
          <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Visualise
          </button>
           {isDataReadyForUpload && (
            <button
              className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleContributeClick}
           >
             Contribute
           </button>
         )}
         
        </div>
        <div>{hasContributed && (
         <p className="text-center mt-4">Thank you for contributing your data!</p>
          )}</div>
      </form>
      
      
    </div>
    
  </div>
);
};

export default Form;