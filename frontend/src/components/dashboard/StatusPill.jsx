const normalize = (value = '') => value.replaceAll(' ', '-');
const StatusPill = ({ value }) => <span className={`status-pill status-pill--${normalize(value)}`}>{value}</span>;
export default StatusPill;
