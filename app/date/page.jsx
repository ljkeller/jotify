export default function Date({ date }) {
    return (
        <div>
            <h1>Date</h1>
            <pre>{JSON.stringify(date, null, 2)}</pre>
        </div>
    );
}