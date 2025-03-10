import React from "react";

interface TitleProps {
  text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => {
  return (
    <div className="col-sm-6 p-0">
      <h4 className="title font-bold">{text}</h4>
      
      <div className="col-xl-12 col-xl-50 col-md-6 box-col-6">
                    <div className="card news-update">
                      <div className="card-header pb-0">
                        <div className="header-top">
                          <h4>News & Update</h4>
                          <div className="dropdown icon-dropdown">
                            <button className="btn dropdown-toggle" id="userdropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="icon-more-alt"></i></button>
                            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="userdropdown"><a className="dropdown-item" href="#">Weekly</a><a className="dropdown-item" href="#">Monthly</a><a className="dropdown-item" href="#">Yearly</a></div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="d-flex align-items-center pt-0">
                          <div className="flex-grow-1 ms-3"><a href="social-app.html">
                              <h5>Indonesian Navy Lauds Mental Perseverance of Teenager...</h5><span>Today's News Headlines, Breaking...</span></a></div>
                          <div className="flex-shrink-0"> 
                            <button className="btn">10 Min ago </button>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 ms-3"><a href="social-app.html">
                              <h5>Why now may be the 'golden age' for Southeast asia start-ups...</h5><span>Check out the latest news from...</span></a></div>
                          <div className="flex-shrink-0"> 
                            <button className="btn">2 Min ago </button>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 ms-3"><a href="social-app.html">
                              <h5>China's renewed crypto crackdown wipes nearly $400...</h5><span>Technology and indian business news...</span></a></div>
                          <div className="flex-shrink-0"> 
                            <button className="btn">14 Min ago </button>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 ms-3"><a href="social-app.html">
                              <h5>Indonesian Navy Lauds Mental Perseverance of Teenager...</h5><span>Today's News Headlines, Breaking...</span></a></div>
                          <div className="flex-shrink-0"> 
                            <button className="btn">17 Min ago </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
    </div>
  );
};

export default Title;
