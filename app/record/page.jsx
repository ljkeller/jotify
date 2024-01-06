
export default function Record({ record }) {
    return (
        <div>
            <h1>Record</h1>
            <pre>{JSON.stringify(record, null, 2)}</pre>
        </div>
    );
}