import storeProfile from "../../context/storeProfile"

export const CardPassword = () => {

    const {user} = storeProfile()

    return (
        <div className="bg-white border border-slate-200 h-auto p-4 
                        flex flex-col items-center justify-between shadow-xl rounded-lg">

            <div className="relative">

                <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-client" className="m-auto rounded-full border-2 border-gray-300" width={120} height={120} />
                
                <label className="absolute bottom-0 right-0 bg-blue-400  text-white rounded-full p-2 cursor-pointer hover:bg-emerald-400">📷
                    <input type="file" accept="image/*" className="hidden" />
                </label>

            </div>

            <div className="self-start">
                <b>Modificar contraseña</b>
            </div>

            <div className="self-start w-full">
                <input type="password" className="w-full p-2 border rounded" placeholder="Nueva contraseña" />
            </div>

            <div className="self-start w-full">
                <input type="password" className="w-full p-2 border rounded" placeholder="Confirmar contraseña" />
            </div>

            <button className="bg-blue-500 text-white px-4 py-2 rounded">Actualizar</button>

        </div>
    )
}
