export default function AliasScroller({ alias }) {
    return (
        <div>
            <h1>Alias</h1>
            <pre>{JSON.stringify(alias, null, 2)}</pre>
        </div>
    );
}