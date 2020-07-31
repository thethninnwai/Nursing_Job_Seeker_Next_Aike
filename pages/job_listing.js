import React from 'react';
import Link from 'next/link'
import LayoutWithFooter from '../components/LayoutWithFooter';
import {db} from "../lib/db";

export default class JobListing extends React.Component {

    constructor (props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.datatableRef = React.createRef();
        this.$datatable = null

        this.initialState = {
            area : '',
            city : '',
            employment_type : '',
            min_exp_year : '',
            min_lang_skill : '',
            posted_within : '',
            min_salary : '',
            max_salary : '',
            regenerated_jobs : props.jobs || [],
            showCities : false,
            cities : []
        }
        this.state = this.initialState

            
        }

        componentDidMount() {
            this.initializeDatatable()
        }
        
        initializeDatatable() {
            this.$datatable = $(this.datatableRef.current).DataTable({
                "pagingType": "full",
                "ordering" : false,
                "bInfo" : false
            });
        }

        refreshTable() {
            this.$datatable.clear()
            const self = this;
            JobListing
            .getInitialProps()
            .then((response) => {
                self.setState({
                    regenerated_jobs: response.jobs
                });
            })
            .bind(this);
        }

        
        applyFilter = async () => {
            this.$datatable.clear()
            let jobs = []
            let toReturnJobs = []
            let REGENERATED_IDS = []
            console.log(this.state)
            const today = new Date()
            try{
                let query = db.collection('job')
            if(this.state.employment_type !== ""){
                query = query.where('employment_type','==',this.state.employment_type)
            }
            if(this.state.area !== ""){
                query = query.where('area','==',this.state.area)
            }
            if(this.state.city !== ""){
                query = query.where('city','==',this.state.city)
            }
            if(this.state.min_salary !== ""){
                query = query.where('min_salary','>=',parseInt(this.state.min_salary))
            }
            if(this.state.min_exp_year !== ""){
                query = query.where('min_exp_year','<=',parseInt(this.state.min_exp_year))
            }
            if(this.state.min_lang_skill !== ""){
                query = query.where('min_lang_skill','<=',parseInt(this.state.min_lang_skill))
            }

                query.get()
                .then(snaphsot => {
                    snaphsot.forEach(doc=>{

                        if(this.state.posted_within !== ""){
                            if(this.state.posted_within == '1'){
                                if(this.checkDateEqual(doc.data().posted_date)){
                                        jobs.push(Object.assign({
                                            id : doc.id,
                                            data : doc.data()
                                        }))
                                }
                            }else if(this.state.posted_within == '2'){
                                if(this.checkDateLastThreeDays(doc.data().posted_date)){
                                        jobs.push(Object.assign({
                                            id : doc.id,
                                            data : doc.data()
                                        }))
                                }
                            }else if(this.state.posted_within == '3'){
                                if(this.checkDateLastSevenDays(doc.data().posted_date)){
                                        jobs.push(Object.assign({
                                            id : doc.id,
                                            data : doc.data()
                                        }))
                                }
                            }else if(this.state.posted_within == '4'){
                                if(this.checkDateThisMonth(doc.data().posted_date)){
                                    jobs.push(Object.assign({
                                        id : doc.id,
                                        data : doc.data()
                                    }))
                                }
                            }
                        }else{
                            jobs.push(Object.assign({
                                id : doc.id,
                                data : doc.data()
                            }))
                        }
                        
                    })

                    REGENERATED_IDS = [...new Set(jobs.map(job => job.id))] 
                    if(REGENERATED_IDS.length > 0){
                        REGENERATED_IDS.forEach(id => {
                            db.collection('job').doc(id).get()
                            .then(snapshot=>{
                                toReturnJobs.push(Object.assign({id : id , data : snapshot.data()}))
                                this.setState({regenerated_jobs : toReturnJobs})
                            })
                        })
                        
                    }this.setState({regenerated_jobs : toReturnJobs})
                    
                })
            }catch(error){
                console.log(error)
            }
            
        }
        checkDateEqual = (dateobj) => {
            const today = new Date()
            var d = new Date(1970, 0, 1);
            d.setSeconds(dateobj.seconds)
            if(d.getDate()+1 == today.getDate()){
                return true
            }else return false
        }
        checkDateLastThreeDays = (dateobj) => {
            const today = new Date()
            var d = new Date(1970, 0, 1);
            d.setSeconds(dateobj.seconds)
            console.log(`Last 3 days is ${today.getDate()-3}`)
            if(today.getDate()-3 <= d.getDate()+1 && d.getDate()+1 <= today.getDate()){
                return true
            }else return false
        }
        checkDateLastSevenDays = (dateobj) => {
            const today = new Date()
            var d = new Date(1970, 0, 1);
            d.setSeconds(dateobj.seconds)
            console.log(`Last 3 days is ${today.getDate()-7}`)
            if(today.getDate()-7 <= d.getDate()+1 && d.getDate()+1 <= today.getDate()){
                console.log("true")
                return true
            }else return false
        }
        checkDateThisMonth = (dateobj) => {
            let today = new Date()
            var d = new Date(1970, 0, 1);
            d.setSeconds(dateobj.seconds)
            if(Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) ) /(1000 * 60 * 60 * 24) )<= 30){
                console.log("true")
                return true
            }else {
                console.log("false")
                return false
            }
        }

        resetFilter = () => {
            this.setState(this.initialState)
            console.log(this.state)
        }
        
        static async getInitialProps (){ 
    
        let jobs = []
        let areas = []
        let cities = []
        let companies = []

        const querySnapshotJob = await db.collection('job').get()
        querySnapshotJob.forEach(doc => {
          jobs.push(Object.assign(
              {id : doc.id,
            data : doc.data()}
          ))
        })

        const querySnapshotArea = await db.collection('area').get()
        querySnapshotArea.forEach(doc => {
          areas.push(Object.assign(
              {id : doc.id,
            data : doc.data()}
          ))
        })

        const querySnapshotCity = await db.collection('city').get()
        querySnapshotCity.forEach(doc => {
          cities.push(Object.assign(
              {id : doc.id,
            data : doc.data()}
          ))
        })

        const querySnapshotCompanies = await db.collection('employer').get()
        querySnapshotCompanies.forEach(doc => {
          companies.push(Object.assign(
              {id : doc.id,
            data : doc.data()}
          ))
        })

        return {jobs, areas, cities, companies}
    }


    handleChange = (event) => {
        this.setState({[event.target.name] : event.target.value})
        if(event.target.name == "area"){
          this.getAreaName(event.target.value)
          this.getCities(event.target.value)
          this.setState({showCities : true})
        }
        if(event.target.name == "area" && event.target.value == ""){
            this.setState({showCities : false})
        }
    }

    reGenerateJobs = (event) => {
        let jobs = []
        this.setState({[event.target.name] : event.target.value})
        if(this.state.regenerated_jobs.length == this.props.jobs.length){
            if(event.target.value == "old_to_new")
            {
                try{
                    db.collection('job').orderBy('posted_date').get()
                    .then(snaphsot => {
                        snaphsot.forEach(doc=>{
                            jobs.push(Object.assign({
                                id : doc.id,
                                data : doc.data()
                            }))
                        })
                        this.setState({regenerated_jobs : jobs})
                    })
                }catch(error){
                    console.log(error)
                }
            }else if(event.target.value == "new_to_old")
            {
               
                try{
                    db.collection('job').orderBy('posted_date').get()
                    .then(snaphsot => {
                        snaphsot.forEach(doc=>{
                            jobs.push(Object.assign({
                                id : doc.id,
                                data : doc.data()
                            }))
                        })
                        this.setState({regenerated_jobs : jobs.reverse()})
                    })
                }catch(error){
                    console.log(error)
                }
            }else {
                try{
                    db.collection('job').get()
                    .then(snaphsot => {
                        snaphsot.forEach(doc=>{
                            jobs.push(Object.assign({
                                id : doc.id,
                                data : doc.data()
                            }))
                        })
                        this.setState({regenerated_jobs : jobs})
                    })
                }catch(error){
                    console.log(error)
                }
            }
        } else {
            jobs = this.state.regenerated_jobs
            if(event.target.value == "old_to_new"){
                jobs.sort(function(a, b) {
                    return a.data.posted_date - b.data.posted_date;
                })
                this.setState({regenerated_jobs : jobs})
            }else if(event.target.value == "new_to_old"){
                jobs.sort(function(a, b) {
                    return b.data.posted_date - a.data.posted_date;
                })
                this.setState({regenerated_jobs : jobs})
            }else {
                jobs = this.state.regenerated_jobs
                this.setState({regenerated_jobs : jobs})
            }
           
        }
        
    }

    getCities = (id) => {
        let cities = []
        try{
            db.collection('city').where('area_id',"==",id).get().
            then((snapshot)=>{
                snapshot.forEach(doc => {
                    cities.push(Object.assign(
                        {id : doc.id,
                      data : doc.data()}
                    ))
                })
                this.setState({cities})
            })
            
        }catch(error){
            console.log(error)
        }
    }


    getCompanyName = (id) => {
        const companies = this.props.companies
        let name = ''
        companies.map(company=>{
            if(company.id == id){
                name = company.data.name
            }
        })
        return name
     }
 
     getLocation = (city_id,area_id) => {
         const cities = this.props.cities
         const areas = this.props.areas
         let city_name = ''
         let area_name = ''
 
         cities.map(city=>{
             if(city.id == city_id){
                 city_name = city.data.name
             }
         })
         areas.map(area=>{
             if(area.id == area_id){
                 area_name = area.data.name
             }
         })
        return city_name + "," + area_name
      }

    getAreaName = (id) => {
        let area = {}
        try{
          db.collection('area').doc(id).get()
          .then((snapshot)=>{
              area = snapshot.data();
              this.setState({areaName : area.name})
          })
      }catch(error){
          console.log(error)
      }
      }

    getDateString = (obj) => {
        var t = new Date(1970, 0, 1);
        t.setSeconds(obj.seconds);
        // console.log(t)
        // console.log(t.getDate()+1+'/'+(t.getMonth()+1)+'/'+t.getFullYear()+' '+ t.getHours()+':'+ t.getMinutes()+':'+ t.getSeconds()+'-'+t.getTimezoneOffset())
        return t.getDate()+'/'+(t.getMonth()+1)+'/'+t.getFullYear()
    }

    filterShow = () => {
        $("#filterModal").modal('show')
    }

    quickView = (id) => {
        let job = {}
        try{
            db.collection('job').doc(id).get()
            .then(snapshot => {
                job = snapshot.data()
                this.setState({
                    view_title : job.title,
                    view_min_salary : job.min_salary,
                    view_max_salary : job.max_salary,
                    view_employment_type : job.employment_type,
                    view_vacancy : job.vacancy,
                    view_min_age : job.min_age,
                    view_work_day : job.work_day,
                    view_work_hour : job.work_hour,
                    view_min_lang_skill : job.min_lang_skill,
                    view_min_exp_year : job.min_exp_year,
                    view_area : job.area,
                    view_city : job.city,
                    view_job_address : job.job_address,
                    view_company : job.company,
                    view_description : job.description,
                    view_requirement : job.requirement,
                    view_other_qualification : job.other_qualification,
                    view_other_message : job.other_message,
                    view_posted_date : job.posted_date
                })
            })
            
        }catch(error){
            console.log(error)
        }
        
    }

    render (){
        const areas = this.props.areas
        const cities = this.state.cities
        const viewCities = this.props.cities

        return (
            <LayoutWithFooter title="Job List">
            <div className="modal fade" id="filterModal" tabindex="-1" role="dialog" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Filter Jobs</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="job-category-listing mb-50">
                        <div className="single-listing pb-50">
    
                            <div className="small-section-tittle2">
                                <h4>Job Area</h4>
                            </div>
                            <div className="select-job-items2">
                                <select name="area" className="form-control" value={this.state.area} onChange={this.handleChange}>
                                    <option value="">Any</option>
                                    {areas && areas.map(area => 
                                        (<option value={area.id}>{area.data.name}</option>)
                                    )}
                                </select>
                            </div>
                        </div>
                        
                        <div className="single-listing">
                            {this.state.showCities && (
                                <React.Fragment>
                                    <div className="small-section-tittle2">
                                        <h4>{this.state.area == "" ? 'Cities' : `Cities in ${this.state.areaName}`}</h4>
                                    </div>
                                    <div className="select-job-items2 pb-50">
                                        <select name="city" className="form-control" value={this.state.city} onChange={this.handleChange}>
                                        <option value="">Any</option>
                                        {cities && cities.map(city => 
                                                (<option value={city.id}>{city.data.name}</option>)
                                            )}
                                        </select>
                                    </div>
                                </React.Fragment>
                            )}
                            
    
                            <div className="select-Categories pb-50">
                                <div className="small-section-tittle2">
                                    <h4>Employment Type</h4>
                                </div>
                                <div className="select-job-items2">
                                <select name="employment_type" className="form-control" value={this.state.employment_type} onChange={this.handleChange}>
                                    <option value="" >Any</option>
                                    <option value="Full">Full Time</option>
                                    <option value="Part">Part Time</option>
                                </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="single-listing">
                            <div className="select-Categories pb-50">
                                <div className="small-section-tittle2">
                                    <h4>Experience</h4>
                                </div>
                                <div className="select-job-items2">
                                <select name="min_exp_year" className="form-control" value={this.state.min_exp_year} onChange={this.handleChange}>
                                    <option value="" >Any</option>
                                    <option value="1">Less Than 1 Year</option>
                                    <option value="2">1-2 Years</option>
                                    <option value="3">2-3 Years</option>
                                    <option value="4">3-6 Years</option>
                                    <option value="5">6 Years and more</option>
                                </select>
                            </div>
                            </div>
                        </div>
                        <div className="single-listing">
                            <div className="select-Categories pb-50">
                                <div className="small-section-tittle2">
                                    <h4>Maximum Japanese Skill</h4>
                                </div>
                                <select name="min_lang_skill" className="form-control" value={this.state.min_lang_skill} onChange={this.handleChange}>
                                    <option value="" >Any</option>
                                    <option value="3">N3</option>
                                    <option value="2">N2</option>
                                    <option value="1">N1</option>  
                                </select>
                            </div>
                        </div>
                        <div className="single-listing">
                            <div className="select-Categories pb-50">
                                <div className="small-section-tittle2">
                                    <h4>Posted Within</h4>
                                </div>
                                <select name="posted_within" className="form-control" value={this.state.posted_within} onChange={this.handleChange}>
                                    <option value="">All Time</option>
                                    <option value="1">Today</option>
                                    <option value="2">Last 3 Days</option> 
                                    <option value="3">Last 7 Days</option> 
                                    <option value="4">Last 30 Days</option>  
    
                                </select>
                            </div>
                        </div>
                        <div className="single-listing">
                            <aside className="left_widgets p_filter_widgets price_rangs_aside sidebar_box_shadow">
                                <div className="small-section-tittle2">
                                    <h4>Minimum Salary</h4>
                                </div>
                                <div className="widgets_inner">
                                    <div className="range_item">
                                        <div className="align-items-center">
                                            <div className="price_text">
                                            </div>
                                            <div className="justify-content-center">
                                                <input type="number" className="form-control" id="min_salary" name="min_salary" value={this.state.min_salary} onChange={this.handleChange} />
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={this.resetFilter} aria-label="Cancel">Reset Filter</button>  
                    <button type="button" className="btn" data-dismiss="modal" onClick={this.applyFilter}>Apply Filter</button>
                </div>
                </div>
            </div>
            </div>
    
            <div className="modal fade" id="quickView" tabindex="-1" role="dialog" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Quick View</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
    
                <form className="register_form">
                    <div className="form-group">
                    <label for="title">Job Title</label>
                        <div className="input-group-icon mt-10">
                            <div className="icon "><i className="fa fa-briefcase" aria-hidden="true "></i></div>
                            <input type="text" value={this.state.view_title} disabled className="single-input"/>
                        </div>
                    </div>
    
                    <div className="container to_up">
                        
                        <div className="row">
                        <div className="form-group two_col_input_left">
                        <label for="min_salary">Minimum Salary</label>
                        <div className="input-group-icon mt-10 ">
                                <div className="icon "><i className="fa fa-yen-sign" aria-hidden="true "></i></div>
                                <input id="min_salary" type="number" value={this.state.view_min_salary} disabled className="single-input"/>
    
                            </div>
                        </div>
                        <div className="form-group two_col_input">
                        <label for="max_salary">Maximum Salary</label>
                        <div className="input-group-icon mt-10 ">
                                <div className="icon "><i className="fa fa-yen-sign" aria-hidden="true "></i></div>
                                <input id="max_salary" type="number" value={this.state.view_max_salary} disabled className="single-input"/>
                            </div>
                        </div>
                        </div> 
                    </div>
    
                    <div className="form-group to_up">
                    <label for="employment_type">Employment Type</label>
                    <div className="input-group-icon mt-10 ">
                    <div className="icon "><i className="fas fa-list " aria-hidden="true "></i></div>
                    <select className="form-control single-input select_border" disabled>
                     
                            <option selected={this.state.view_employment_type == "Full" ? ("selected") : ("false")} disabled>Full Time</option>
                            <option selected={this.state.view_employment_type == "Part" ? ("selected") : ("false")} disabled>Part Time</option>   
                    </select>
                    </div>
                    </div>
    
                    <div className="form-group to_up">
                    <label for="min_age">Vacancy</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-briefcase" aria-hidden="true "></i></div>
                        <input type="number"  value={this.state.view_vacancy} disabled className="single-input"/>
                    </div>
                    </div>
    
                    <div className="form-group to_up">
                    <label for="min_age">Minimum Required Age</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-child" aria-hidden="true "></i></div>
                        <input type="number"  value={this.state.view_min_age} disabled className="single-input"/>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="work_day">Work Days</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-calendar-alt " aria-hidden="true "></i></div>
                        <textarea  cols="30" rows="4"  value={this.state.view_work_day} className="single-input" disabled></textarea>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="work_hour">Work Hours</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-clock " aria-hidden="true "></i></div>
                        <textarea cols="30" rows="4" value={this.state.view_work_hour} className="single-input" disabled></textarea>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="min_lang_skill">Minimum Japanese Language Skill</label>
                    <div className="input-group-icon mt-10 ">
                    <div className="icon "><i className="fas fa-language " aria-hidden="true "></i></div>
                    <select className="form-control single-input select_border" disabled>
                            <option selected={this.state.view_min_lang_skill == 3 ? ("selected") : ("false")} disabled>N3</option>
                            <option selected={this.state.view_min_lang_skill == 2 ? ("selected") : ("false")} disabled>N2</option>
                            <option selected={this.state.view_min_lang_skill == 1 ? ("selected") : ("false")} disabled>N1</option>  
                    </select>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="min_exp_year">Minimum Experience Years</label>
                    <div className="input-group-icon mt-10 ">
                    <div className="icon "><i className="fas fa-calendar-check " aria-hidden="true "></i></div>
                    <select className="form-control single-input select_border" disabled>
                            <option selected={this.state.view_min_exp_year == 1 ? ("selected") : ("false")} disabled>Less Than 1 Year</option>
                            <option selected={this.state.view_min_exp_year == 2 ? ("selected") : ("false")} disabled>1-2 Years</option>
                            <option selected={this.state.view_min_exp_year == 3 ? ("selected") : ("false")} disabled>2-3 Years</option>
                            <option selected={this.state.view_min_exp_year == 4 ? ("selected") : ("false")} disabled>3-6 Years</option>
                            <option selected={this.state.view_min_exp_year == 5 ? ("selected") : ("false")} disabled>6 Years and more</option> 
                    </select>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="area">Area</label>
                    <div className="input-group-icon mt-10 ">
                        <div className="icon "><i className="fas fa-map-marker-alt " aria-hidden="true "></i></div>
                            <select className="form-control single-input select_border" disabled>
                                
                                {areas && areas.map(area => (
                                this.state.view_area == area.id ? <option selected disabled>{area.data.name}</option> : <option value={area.id}>{area.data.name}</option>
                                ))}
                            </select>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="city">City</label>
                    <div className="input-group-icon mt-10 ">
                        <div className="icon "><i className="fas fa-map-marker-alt " aria-hidden="true "></i></div>
                        <select className="form-control single-input select_border" disabled>
                        {
                        viewCities && viewCities.map(city => (
                            this.state.view_city == city.id ? <option selected disabled>{city.data.name}</option> : <option value={city.id}>{city.data.name}</option>
                        ))
                        }
                    </select>
                    </div>
                    </div>
    
                    <div className="form-group to_up">
                    <label for="job_address">Job Address</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-home " aria-hidden="true "></i></div>
                        <textarea cols="30" rows="4"  value={this.state.view_job_address} className="single-input" disabled></textarea>
                    </div>
                    </div>    
    
                    <div className="form-group to_up">
                    <label for="description">Description</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-tasks " aria-hidden="true "></i></div>
                        <textarea cols="30" rows="4"  value={this.state.view_description} className="single-input" disabled></textarea>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="requirement">Requirements</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-tasks " aria-hidden="true "></i></div>
                        <textarea cols="30" rows="4"  value={this.state.view_requirement} className="single-input" disabled></textarea>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="other_qualification">Other Qualifications</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-tasks " aria-hidden="true "></i></div>
                        <textarea cols="30" rows="4"  value={this.state.view_other_qualification} className="single-input" disabled></textarea>
                    </div>
                    </div>
                    <div className="form-group to_up">
                    <label for="other_message">Other Message</label>
                    <div className="input-group-icon mt-10">
                        <div className="icon "><i className="fa fa-comments " aria-hidden="true "></i></div>
                        <textarea cols="30" rows="4"  value={this.state.view_other_message} className="single-input" disabled></textarea>
                    </div>
                    </div>
    
                </form>
                </div>
            </div>
            </div>
            </div>
    
    
    
            <div className="job-listing-area pt-120 pb-120">
                <div className="container">
                    <div className="row">
                        
                        <div className="col-xl-12 col-lg-12 col-md-8">
                            <section className="featured-job-area">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="count-job mb-35">
                                            <a onClick={this.filterShow} className="filter_btn"><img style={{width : 1+"em",height : 1+"em", marginRight : 1+"em"}} src="/assets/img/logo/filter.png"></img>Filter jobs</a>
                                               
                                                
                                                <h5>{ this.state.regenerated_jobs.length > 0 && `${this.state.regenerated_jobs.length} - Jobs Found` || `No Jobs Found !`}</h5>
                                                
                                                <div className="select-job-items">
                                                    <span>Sort by</span>
                                                    <select name="sortby" style={{marginRight : 1+"em"}} onChange={this.reGenerateJobs}>
                                                        <option value="none">None</option>
                                                        <option value="new_to_old">Newest to Oldest</option>
                                                        <option value="old_to_new">Oldest to Newest</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                <table ref={this.datatableRef} style={{width : 100 + "%"}}>
                <thead>
                    <tr>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.regenerated_jobs && this.state.regenerated_jobs.map((job) => (
                        <tr id={job.id} >
    
                    <td className="single-job-items " style={{paddingBottom : 50+"px",paddingTop : 50+"px"}}>
                        <div className="job-items">
                            <div className="company-img">
                                <Link href={`/job_detail?id=${job.id}`}><a><img src="/assets/img/icon/job-list1.png" alt=""/></a></Link>
                            </div>
                            <div className="job-tittle job-tittle2">
                                <Link href={`/job_detail?id=${job.id}`}><a>
                                    <h4>{job.data.title}</h4>
                                </a></Link>
                                <ul>
                                    <li><i className="fas fa-building "></i>{this.getCompanyName(job.data.company)}</li>
                                    <li><i className="fas fa-map-marker-alt "></i>{this.getLocation(job.data.city,job.data.area)}</li>
    
                                </ul>
                                <ul>
                                    <li><i className="fas fa-calendar-alt "></i>{this.getDateString(job.data.posted_date)}</li>
                                    <li><i className="fas fa-yen-sign "></i>{`${job.data.min_salary} ~ ${job.data.max_salary}`}</li>
                                    <li><i className="fas fa-clock "></i>{`${job.data.employment_type} time`}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="items-link items-link2 f-right ">
                            <a data-toggle="modal" data-target="#quickView" onClick={()=>this.quickView(job.id)} style={{cursor : "pointer"}}>Quick View</a>
                            <Link href={`/job_detail?id=${job.id}`}><a>View Details</a></Link>
                        </div>
                    </td>
                        </tr>
                    ) )
                    }
                </tbody>
            </table>
                                    
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            </LayoutWithFooter>
        
        
        )
    }
}




