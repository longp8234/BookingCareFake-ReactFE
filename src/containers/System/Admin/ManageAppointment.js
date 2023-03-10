import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import * as actions from "../../../store/actions";
import './ManageAppointment.scss';
import DatePicker from '../../../components/Input/DatePicker';
import { LANGUAGES } from '../../../utils';
import { getAllAppointment, postSendBill } from '../../../services/userService';
import moment from 'moment';
import BillModal from './BillModal';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';


class ManageAppointment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(new Date()).startOf('day').valueOf(),
            dataPatient: [],
            isOpenBillModal: false,
            dataModal: {},
            isShowLoading: false,
        }
    }

    async componentDidMount() {
        
        this.getDataPatient()
    }

    getDataPatient = async () => {
        let { user } = this.props;
        let { currentDate } = this.state
        let formattedDate = new Date(currentDate).getTime();

        let res = await getAllAppointment({
            doctorId: user.id,
            date: formattedDate
        })

        if (res && res.errCode === 0) {
            this.setState({
                dataPatient: res.data,
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    } 

    handleOnChangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        }, async () => {
            await this.getDataPatient()
        })
    }

    handleBtnConfirm = (item) => {
        console.log('check timetype: ', item);
        let data = {
            doctorId: item.doctorId,
            patientId: item.patientId,
            email: item.patientData.email,
            timeType: item.timeType,
            patientName: item.patientData.firstName,
        }

        this.setState({
            isOpenBillModal: true,
            dataModal: data,
        })
    }

    closeModalBill = () => {
        this.setState({
            isOpenBillModal: false,
            dataModal: {},
        })
    }

    sendBill = async (dataFromModalBill) => {
        let { dataModal } = this.state;
        this.setState({
            isShowLoading: true,
        })
        let res = await postSendBill({
            email: dataFromModalBill.email,
            imgBase64: dataFromModalBill.imgBase64,
            doctorId: dataModal.doctorId,
            patientId: dataModal.patientId,
            timeType: dataModal.timeType,
            patientName: dataModal.patientName,
            language: this.props.language,
        })

        console.log('check res: ', res);


        if (res && res.errCode === 0) {
            toast.success('G???i th??ng tin x??c nh???n l???ch h???n th??nh c??ng');
            this.closeModalBill()
            await this.getDataPatient()
            this.setState({
                isShowLoading: false,
            })
        } else {
            toast.error('G???i th??ng tin x??c nh???n l???ch h???n ch??a th??nh c??ng');
            this.setState({
                isShowLoading: false,
            })
        }
    }


    render() {
        let { dataPatient, isOpenBillModal, dataModal } = this.state;
        let { language } = this.props; 

        return (
            <>
                <div className='manage-appointment-container'>
                    <div className='manage-appointment-content'>
                        <div className='manage-appointment-title'>Qu???n l?? l???ch h???n kh??m</div>
                        <div className='manage-appointment-body row'>
                            <div className='col-4 form-group'>
                                <label>Ch???n ng??y kh??m</label>
                                <DatePicker
                                    onChange={this.handleOnChangeDatePicker}
                                    className='form-control mt-1'
                                    value={this.state.currentDate}
                                />
                            </div>
                        </div>
                        <div className='manage-appointment-table'>
                            <table class="table table-striped table-bordered table-hover">
                                <thead class="table-primary">
                                    <tr>
                                        <th>STT</th>
                                        <th>Th???i gian kh??m</th>
                                        <th>H??? t??n</th>
                                        <th>Email</th>
                                        <th>S??? ??i???n tho???i</th>
                                        <th>?????a ch???</th>
                                        <th>Gi???i t??nh</th>
                                        <th>L?? do kh??m</th>
                                        <th>Thao t??c</th>
                                    </tr>
                                </thead>
                                <tbody className='table-body'>
                                    {dataPatient && dataPatient.length > 0 ? dataPatient.map((item, index) => {
                                        let gender = language === LANGUAGES.VI ? item.patientData.genderData.valueVi : item.patientData.genderData.valueEn
                                        let time = language === LANGUAGES.VI ? item.timeTypeDataPatient.valueVi : item.timeTypeDataPatient.valueEn
                                        return (
                                            <tr key={index}>
                                                <th>{ index + 1 }</th>
                                                <th>{ time }</th>
                                                <th>{ item.patientData.firstName }</th>
                                                <th>{ item.patientData.email }</th>
                                                <th>{ item.patientData.phoneNumber }</th>
                                                <th>{ item.patientData.address }</th>
                                                <th>{ gender}</th>
                                                <th>{ item.patientData.lastName }</th>
                                                <th>
                                                    <button className='btn btn-warning btn-sm btn-confirm'
                                                        onClick={() => this.handleBtnConfirm(item)}>
                                                        X??c nh???n
                                                    </button>
                                                </th>
                                            </tr>
                                        )
                                    }) : <tr>
                                            <th colSpan={9}>NO DATA</th>
                                        </tr>
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <BillModal isOpenModal={isOpenBillModal}
                    dataModal={dataModal}
                    closeModalBill={this.closeModalBill}
                    sendBill={this.sendBill}
                />

                <LoadingOverlay
                    active={this.state.isShowLoading}
                    spinner
                    text='Loading...'
                />
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        user: state.user.userInfo,
        allDoctors: state.admin.allDoctors,

    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageAppointment);
