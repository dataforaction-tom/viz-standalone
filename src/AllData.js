import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { parseISO, format } from 'date-fns';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { supabase } from './supabaseClient'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement);


const AllData = () => {
  const [activityPieChartData, setActivityPieChartData] = useState({ labels: [], datasets: [] });
  const [typeOfInsightChartData, setTypeOfInsightChartData] = useState({ labels: [], datasets: [] });
  const [ageRangeChartData, setAgeRangeChartData] = useState({ labels: [], datasets: [] });
  const [peoplePerMonthChartData, setPeoplePerMonthChartData] = useState({ labels: [], datasets: [] });
  const [peoplePerYearChartData, setPeoplePerYearChartData] = useState({ labels: [], datasets: [] });
  const [localAuthorityData, setLocalAuthorityData] = useState({ labels: [], datasets: [] });
  const [peopleByLocalAuthorityData, setPeopleByLocalAuthorityData] = useState({ labels: [], datasets: [] });
  



  useEffect(() => {
    const fetchDataAndAggregate = async () => {
      let { data, error } = await supabase
        .from('main_data')
        .select('activity, number_of_people, type_of_insight, age_range, date, local_authority');

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      // Aggregating data for each category
      const activityData = aggregateData(data, 'activity');
      const typeOfInsightData = aggregateData(data, 'type_of_insight');
      const ageRangeData = aggregateData(data, 'age_range');
      const localAuthorityAggregated = aggregateData(data, 'local_authority');
      const peopleByLocalAuthorityAggregated = aggregateDataBySum(data, 'local_authority', 'number_of_people');
      const monthData = {};
      const yearData = {};
        data.forEach(item => {
            const date = parseISO(item.date);
            const monthKey = format(date, 'MMM yyyy');
            const yearKey = format(date, 'yyyy');
            monthData[monthKey] = (monthData[monthKey] || 0) + parseInt(item.number_of_people, 10);
            yearData[yearKey] = (yearData[yearKey] || 0) + parseInt(item.number_of_people, 10);
            });


      // Preparing and setting chart data
      setActivityPieChartData(preparePieChartData(activityData, 'Activity Share'));
      setTypeOfInsightChartData(prepareChartData(typeOfInsightData, 'Number of People by Type of Insight'));
      setAgeRangeChartData(prepareChartData(ageRangeData, 'Number of People by Age Range'));
      setPeoplePerMonthChartData(prepareLineChartData(monthData, 'Number of People per Month'));
      setPeoplePerYearChartData(prepareChartData(yearData, 'Number of People per Year'));
      setLocalAuthorityData(prepareChartData(localAuthorityAggregated, 'Local Authority Count'));
      setPeopleByLocalAuthorityData(prepareChartData(peopleByLocalAuthorityAggregated, 'Number of People by Local Authority'));
    };

    fetchDataAndAggregate();
  }, []);

  return (
    <div>
      <div className='text-center bg-gray-800 text-white'>
      <p className="text-xl font-semibold">Please note, all data in here is currently dummy data for testing purposes. <br></br>You can read the full context of our work and where this prototype came from on our notion site <a href='https://dataforaction.notion.site/Prototyping-insight-infrastructure-for-the-charity-sector-b53e4b066c2440f6b91f1ad0f334fc8c' title="Data For Action Charity Data Works Project" className="text-pink-500 font-bold" rel="noreferrer" target="_blank">here.</a></p>
      <h1 className="text-3xl font-semibold text-center pb-8 pt-8 bg-gray-800 text-white">Visualising data from all contributers</h1>
      
      </div>
    <div className="flex flex-wrap justify-center -mx-2">
      
      {activityPieChartData.labels.length > 0 && (
        <div className="w-full md:w-1/2 p-2 ">
          <h1 className="text-center font-bold">Activity Participation Share</h1>
          <div className="max-w-sm mx-auto">
            <Pie data={activityPieChartData} />
          </div>
        </div>
      )}

      

      {ageRangeChartData.labels.length > 0 && (
        <div className="w-full md:w-1/2 p-2 ">
          <h1 className="text-center font-bold">Age Range</h1>
          <div className="w-full">
            <Bar data={ageRangeChartData} options={{ scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      )}
      {typeOfInsightChartData.labels.length > 0 && (
        <div className="w-full md:w-1/2 p-2">
          <h1 className="text-center font-bold">Type of Insight</h1>
          <div className="w-full h--2">
            <Bar data={typeOfInsightChartData} options={{indexAxis: 'y', scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      )}
      {peoplePerMonthChartData.labels.length > 0 && (
  <div className="w-full md:w-1/2 p-2">
    <h1 className="text-center font-bold">Number of People per Month</h1>
    <div className="w-full">
      <Line data={peoplePerMonthChartData} options={{ scales: { y: { beginAtZero: true } }}} />
    </div>
  </div>
)}

{peoplePerYearChartData.labels.length > 0 && (
  <div className="w-full md:w-1/2 p-2">
    <h1 className="text-center font-bold">Number of People per Year</h1>
    <div className="w-full">
      <Bar data={peoplePerYearChartData} options={{ scales: { y: { beginAtZero: true } }}} />
    </div>
  </div>
)}
      {localAuthorityData.labels.length > 0 && (
        <div className="w-full md:w-1/2 p-2">
          <h1 className="text-center font-bold">Local Authority Count</h1>
          <div className="w-full">
            <Bar data={localAuthorityData} options={{ scales: { y: { beginAtZero: true } }}} />
          </div>
        </div>
      )}

      
      {peopleByLocalAuthorityData.labels.length > 0 && (
        <div className="w-full md:w-1/2 p-2">
          <h1 className="text-center font-bold">Number of People by Local Authority</h1>
          <div className="w-full">
            <Bar data={peopleByLocalAuthorityData} options={{ scales: { y: { beginAtZero: true } }}} />
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

function aggregateData(data, field) {
  return data.reduce((acc, curr) => {
    const key = curr[field];
    const value = parseInt(curr.number_of_people, 10);
    acc[key] = (acc[key] || 0) + value;
    return acc;
  }, {});
}

function prepareChartData(aggregatedData, chartLabel) {
  const labels = Object.keys(aggregatedData);
  const dataPoints = Object.values(aggregatedData);
  const backgroundColors = labels.map(() => getRandomColor());
  
  return {
    labels,
    datasets: [{
      label: chartLabel,
      data: dataPoints,
      backgroundColor: backgroundColors,
      borderColor: backgroundColors.map(color => color.replace(/0.5\)$/, "1)")),
      borderWidth: 1,
    }],
  };
}

function preparePieChartData(aggregatedData, chartLabel) {
  return prepareChartData(aggregatedData, chartLabel); 
}

function prepareLineChartData(aggregatedData, chartLabel) {
    const labels = Object.keys(aggregatedData).sort();
    const dataPoints = labels.map(label => aggregatedData[label]);
    return {
      labels,
      datasets: [{
        label: chartLabel,
        data: dataPoints,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }

function getRandomColor() {
  return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
}

function aggregateDataBySum(data, categoryField, sumField) {
  return data.reduce((acc, curr) => {
    const key = curr[categoryField];
    const value = parseInt(curr[sumField], 10);
    acc[key] = (acc[key] || 0) + value;
    return acc;
  }, {});
}



export default AllData;
