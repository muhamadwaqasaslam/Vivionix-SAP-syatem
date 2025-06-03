import React from 'react';

const RecentCustomers = () => {
  const customers = [
    {
      name: "Samantha Melon",
      userId: "#1234",
      status: "Paid",
      statusClass: "text-success",
      image: "/valex-ts/preview/assets/3-DP_nqjjJ.jpg",
      chartColor: "rgba(10,154,225,0.85)"
    },
    {
      name: "Jimmy Changa",
      userId: "#1234",
      status: "Pending",
      statusClass: "text-danger",
      image: "/valex-ts/preview/assets/11-Bto6gfGH.jpg",
      chartColor: "rgba(255,81,110,0.85)"
    },
    {
      name: "Gabe Lackmen",
      userId: "#1234",
      status: "Pending",
      statusClass: "text-danger",
      image: "/valex-ts/preview/assets/17-Dk_pMVJX.jpg",
      chartColor: "rgba(40,185,138,0.85)"
    },
    {
      name: "Manuel Labor",
      userId: "#1234",
      status: "Paid",
      statusClass: "text-success",
      image: "/valex-ts/preview/assets/15-Dhh28AJh.jpg",
      chartColor: "rgba(244,136,70,0.85)"
    },
    {
      name: "Sharon Needles",
      userId: "#1234",
      status: "Paid",
      statusClass: "text-success",
      image: "data:image/jpeg;base64,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",
      chartColor: "rgba(103,58,183,0.85)"
    }
  ];

  return (
    <div className="overflow-hidden card">
      <div className="pb-1 card-header">
        <h3 className="mb-2 card-title">Recent Customers</h3>
        <p className="fs-12 mb-0 text-muted">A customer is an individual or business that purchases the goods service has evolved to include real-time</p>
      </div>
      <div className="p-0 customers mt-1 card-body">
        <div className="list-lg-group Axis_none list-group list-group-flush">
          {customers.map((customer, index) => (
            <div key={index} className={`list-group-item-action ${index === customers.length - 1 ? 'br-t-1 br-br-7 br-bl-7' : 'br-t-1'} list-group-item`}>
              <div className="d-flex">
                <img className="avatar avatar-md rounded-circle my-auto me-3" src={customer.image} alt={customer.name} />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <div className="mt-0">
                      <h5 className="mb-1 fs-15">{customer.name}</h5>
                      <p className="mb-0 fs-13 text-muted">User ID: {customer.userId} <span className={`${customer.statusClass} ms-2 d-inline-block`}>{customer.status}</span></p>
                    </div>
                    <span className="ms-auto w-45 fs-16 mt-2">
                      <div className="wd-100p" style={{ minHeight: '38px' }}>
                        <div className="apexcharts-canvas" style={{ width: '103px', height: '38px' }}>
                          <svg width="103" height="38" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" xmlnsSvgjs="http://svgjs.dev" className="apexcharts-svg" xmlnsData="ApexChartsNS" transform="translate(0, 0)">
                            <foreignObject x="0" y="0" width="103" height="38">
                              <div className="apexcharts-legend" xmlns="http://www.w3.org/1999/xhtml" style={{ maxHeight: '19px' }}></div>
                            </foreignObject>
                            <g className="apexcharts-inner apexcharts-graphical" transform="translate(50, 10)">
                              <path d="M 0 11.571428571428571 L 5.888888888888889 1.0285714285714285 L 11.777777777777779 7.457142857142857 L 17.666666666666668 2.828571428571429 L 23.555555555555557 11.571428571428571 L 29.444444444444446 6.685714285714285 L 35.333333333333336 14.914285714285715 L 41.22222222222222 8.742857142857142 L 47.111111111111114 15.685714285714285 L 53 12.6" 
                                fill="none" 
                                fillOpacity="1" 
                                stroke={customer.chartColor} 
                                strokeOpacity="1" 
                                strokeLinecap="butt" 
                                strokeWidth="2" 
                                strokeDasharray="0" 
                                className="apexcharts-line" 
                                index="0" 
                                clipPath="url(#gridRectMask83l7wixg)" 
                                filter="url(#SvgjsFilter3226)" 
                                pathTo="M 0 11.571428571428571 L 5.888888888888889 1.0285714285714285 L 11.777777777777779 7.457142857142857 L 17.666666666666668 2.828571428571429 L 23.555555555555557 11.571428571428571 L 29.444444444444446 6.685714285714285 L 35.333333333333336 14.914285714285715 L 41.22222222222222 8.742857142857142 L 47.111111111111114 15.685714285714285 L 53 12.6" 
                                pathFrom="M 0 18 L 0 18 L 5.888888888888889 18 L 11.777777777777779 18 L 17.666666666666668 18 L 23.555555555555557 18 L 29.444444444444446 18 L 35.333333333333336 18 L 41.22222222222222 18 L 47.111111111111114 18 L 53 18" 
                                fillRule="evenodd">
                              </path>
                            </g>
                          </svg>
                        </div>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentCustomers; 