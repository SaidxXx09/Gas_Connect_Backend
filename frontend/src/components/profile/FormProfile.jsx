import storeProfile from "../../context/storeProfile"

export const FormProfile = () => {

    const {user, updateProfile} = storeProfile()

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            nombre: e.target.nombre.value,
            apellido: e.target.apellido.value,
            direccion: e.target.direccion.value,
            celular: e.target.celular.value
        }

        updateProfile(data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>Nombre</label>
                <input name="nombre" defaultValue={user?.nombre} className="w-full p-2 border rounded" />
            </div>
            <div>
                <label>Apellido</label>
                <input name="apellido" defaultValue={user?.apellido} className="w-full p-2 border rounded" />
            </div>
            <div>
                <label>Dirección</label>
                <input name="direccion" defaultValue={user?.direccion} className="w-full p-2 border rounded" />
            </div>
            <div>
                <label>Celular</label>
                <input name="celular" defaultValue={user?.celular} className="w-full p-2 border rounded" />
            </div>

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Guardar</button>
        </form>
    )
}
